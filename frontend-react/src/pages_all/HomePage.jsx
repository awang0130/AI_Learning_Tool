import { Link } from "react-router-dom";
import { usePlan } from "../context/PlanContext.jsx";

export default function HomePage() {
  const { state, actions } = usePlan();

  const totalDays = state.plan?.length || 0;
  const completedCount = Object.values(state.progress || {}).filter(
    Boolean
  ).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link to="/">Landing</Link>
        <Link to="/results">Results</Link>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Home</h2>
        <div>
          <strong>Topic:</strong> {state.topic || "—"}
        </div>
        <div>
          <strong>Level:</strong> {state.level || "—"}
        </div>
        <div>
          <strong>Minutes/day:</strong> {state.minutes || "—"}
        </div>
        <div>
          <strong>Goal:</strong> {state.goal || "—"}
        </div>
        <div>
          <strong>Formats:</strong> {(state.formats || []).join(", ")}
        </div>
        <div style={{ marginTop: 10 }}>
          <strong>Progress:</strong> {completedCount} / {totalDays} days
          complete
        </div>
      </div>

      {totalDays > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Mark completion</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {state.plan.map((d) => {
              const done = !!state.progress?.[d.day];
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => actions.toggleDayComplete(d.day)}
                  style={{
                    opacity: done ? 1 : 0.8,
                  }}
                >
                  Day {d.day}: {done ? "✅" : "⬜"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
