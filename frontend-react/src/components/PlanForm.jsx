import { Sparkles, Loader2 } from "lucide-react";

export default function PlanForm({
  topic,
  setTopic,
  level,
  setLevel,
  minutes,
  setMinutes,
  goal,
  setGoal,
  fmtVideo,
  setFmtVideo,
  fmtReading,
  setFmtReading,
  fmtInteractive,
  setFmtInteractive,
  loading,
  error,
  onSubmit,
}) {
  return (
    <form className="card" onSubmit={onSubmit}>
      {/* Topic */}
      <label className="field">
        Topic
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </label>

      {/* Level + Minutes */}
      <div className="row">
        <label className="field">
          Level
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label className="field">
          Minutes / day
          <input
            type="number"
            min="10"
            max="180"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
      </div>

      {/* Goal */}
      <label className="field">
        Goal (optional)
        <input value={goal} onChange={(e) => setGoal(e.target.value)} />
      </label>

      {/* Formats */}
      <fieldset className="fieldset">
        <legend>Format preferences</legend>

        <label className="check">
          <input
            type="checkbox"
            checked={fmtVideo}
            onChange={(e) => setFmtVideo(e.target.checked)}
          />
          Video
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={fmtReading}
            onChange={(e) => setFmtReading(e.target.checked)}
          />
          Reading
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={fmtInteractive}
            onChange={(e) => setFmtInteractive(e.target.checked)}
          />
          Interactive
        </label>
      </fieldset>

      {/* Submit */}
      <div className="formActions">
        <button disabled={loading} type="submit">
          {loading ? (
            <Loader2 className="spin" size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? "Generating..." : "Generate plan"}
        </button>

        {error && <div className="error">Error: {error}</div>}
      </div>
    </form>
  );
}
