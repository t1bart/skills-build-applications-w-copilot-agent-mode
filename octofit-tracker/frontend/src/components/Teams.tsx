import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot: string; members: Array<string | { _id?: string; name?: string }> };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  return (
    <CapabilityCard<TeamResponse>
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyText="No teams yet."
      isEmpty={({ teams }) => teams.length === 0}
    >
      {({ teams }) => (
        <ul className="list-group">
          {teams.map((team, index) => (
            <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
              <strong>{team.name}</strong> ({team.mascot})
              {team.members.length > 0 && (
                <span> — Members: {team.members.map((member) => typeof member === 'string' ? member : member.name ?? member._id).join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
