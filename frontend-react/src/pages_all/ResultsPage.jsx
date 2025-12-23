import { useLocation, Link } from "react-router-dom";
import PlanResults from "../components/PlanResults.jsx";

export default function ResultsPage() {
  const { state } = useLocation();
  const plan = state?.plan ?? [];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <Link to="/">← Back</Link>
        <Link to="/home">Go to Home</Link>
      </div>

      <PlanResults plan={plan} />

      {plan.length === 0 && (
        <div className="card">
          No plan found. Go back to the landing page and generate one.
        </div>
      )}
    </div>
  );
}
