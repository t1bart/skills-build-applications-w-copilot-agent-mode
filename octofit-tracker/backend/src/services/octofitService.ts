import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type ServiceError = Error & { status: number };

function serviceError(status: number, message: string): ServiceError {
  return Object.assign(new Error(message), { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function objectId(value: unknown, field: string): Types.ObjectId {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    throw serviceError(400, `${field} must be a valid ID`);
  }
  return new Types.ObjectId(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw serviceError(400, 'Activity details are required');

  const userId = objectId(input.userId, 'userId');
  const teamId = objectId(input.teamId, 'teamId');
  const type = typeof input.type === 'string' ? input.type.trim() : '';
  const minutes = input.minutes;
  if (!type || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw serviceError(400, 'A type and positive number of minutes are required');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw serviceError(404, 'The requested user or team was not found');

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw serviceError(400, 'Team details are required');

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const mascot = typeof input.mascot === 'string' ? input.mascot.trim() : '';
  if (!name || !mascot) throw serviceError(400, 'A team name and mascot are required');

  const rawMembers = input.members ?? [];
  if (!Array.isArray(rawMembers)) throw serviceError(400, 'Team members must be an array');
  const memberIds = rawMembers.map((member) => objectId(member, 'member ID'));
  if (memberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
    if (memberCount !== new Set(memberIds.map(String)).size) {
      throw serviceError(404, 'One or more team members were not found');
    }
  }

  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw serviceError(404, 'User not found');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1, _id: -1 }).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    walk: 'endurance',
    strength: 'strength',
    yoga: 'mobility',
    stretch: 'mobility',
  };
  const focus = recentActivity
    ? activityFocus[recentActivity.type.toLowerCase()] ?? user.fitnessGoal
    : user.fitnessGoal;
  const reason = recentActivity
    ? `Based on your recent ${recentActivity.type} activity.`
    : `Supports your ${user.fitnessGoal} fitness goal.`;
  const workouts = await Workout.find().lean();
  return workouts
    .sort((left, right) => Number(right.focus.toLowerCase() === focus.toLowerCase()) - Number(left.focus.toLowerCase() === focus.toLowerCase()))
    .map((workout) => ({ ...workout, reason }));
}

export { User };
