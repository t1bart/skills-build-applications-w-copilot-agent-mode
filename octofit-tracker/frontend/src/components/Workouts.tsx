import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { _id?: string; title: string; focus: string; minutes?: number; difficulty?: string; reason: string };
type WorkoutResponse = { suggestions: WorkoutSuggestion[] };
const userEmail = 'mona@example.com';

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path={`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`}
      emptyText="No workout suggestions are available."
      isEmpty={({ suggestions }) => suggestions.length === 0}
    >
      {({ suggestions }) => (
        <ul className="list-group">
          {suggestions.map((workout, index) => (
            <li className="list-group-item" key={workout._id ?? `${workout.title}-${index}`}>
              <strong>{workout.title}</strong> — {workout.focus}
              {workout.minutes !== undefined && `, ${workout.minutes} minutes`}
              {workout.difficulty && ` (${workout.difficulty})`}
              <p className="mb-0">{workout.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
