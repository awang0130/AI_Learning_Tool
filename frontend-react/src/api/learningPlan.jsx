const API_BASE = "http://127.0.0.1:8000";

export async function fetchPlan({ topic, level, minutes, formats, goal }) {
  const payload = {
    topic: topic.trim(),
    level,
    minutes_per_day: Number(minutes),
    format_preferences: formats,
    goal: goal?.trim() || null,
    constraints: {},
  };

  const resp = await fetch(`${API_BASE}/plan_with_links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.detail || `HTTP ${resp.status}`);

  return Array.isArray(data) ? data : data.days || [];
}
