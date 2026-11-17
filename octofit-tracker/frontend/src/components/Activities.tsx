import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  return (
    <CapabilityCard<ActivityResponse>
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyText="No activities yet."
      isEmpty={({ activities }) => activities.length === 0}
    >
      {({ activities }) => (
        <ul className="list-group">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={activity._id ?? `${activity.type}-${index}`}>
              <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
