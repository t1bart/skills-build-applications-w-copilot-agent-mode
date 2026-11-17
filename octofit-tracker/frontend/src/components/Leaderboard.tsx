import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyText="No leaderboard rankings yet."
      isEmpty={({ leaderboard }) => leaderboard.length === 0}
    >
      {({ leaderboard }) => (
        <ol className="list-group list-group-numbered">
          {leaderboard.map(({ teamName, totalPoints, rank }) => (
            <li className="list-group-item" key={teamName}>
              <span className="fw-bold">{teamName}</span>: {totalPoints} points (rank {rank})
            </li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
