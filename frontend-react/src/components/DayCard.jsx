import { ExternalLink } from "lucide-react";

export default function DayCard({ day }) {
  return (
    <div className="dayCard">
      <h3 className="dayTitle">
        Day {day.day}: {day.objective}
      </h3>

      {Array.isArray(day.resources) && day.resources.length > 0 && (
        <>
          <div className="sectionLabel">Resources</div>
          <ul className="list">
            {day.resources.map((r, idx) => (
              <li key={idx}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.title || r.url}
                  <ExternalLink
                    size={14}
                    style={{ marginLeft: 6, verticalAlign: "middle" }}
                  />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {Array.isArray(day.key_points) && day.key_points.length > 0 && (
        <>
          <div className="sectionLabel">Key points</div>
          <ul className="list">
            {day.key_points.map((kp, idx) => (
              <li key={idx}>{kp}</li>
            ))}
          </ul>
        </>
      )}

      {day.exercise && (
        <div className="note">
          <strong>Exercise:</strong> {day.exercise}
        </div>
      )}

      {day.checkpoint_question && (
        <div className="note">
          <strong>Checkpoint:</strong> {day.checkpoint_question}
        </div>
      )}
    </div>
  );
}
