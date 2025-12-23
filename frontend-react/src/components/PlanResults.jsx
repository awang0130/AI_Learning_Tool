import DayCard from "./DayCard.jsx";

export default function PlanResults({ plan }) {
  if (!plan || plan.length === 0) {
    return (
      <div className="card">No plan generated yet. Go back and create one.</div>
    );
  }

  return (
    <section className="results">
      <h2>Your 30-day plan</h2>

      {plan.map((day) => (
        <DayCard key={day.day} day={day} />
      ))}
    </section>
  );
}
