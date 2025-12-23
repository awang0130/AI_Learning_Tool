import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import PlanForm from "../components/PlanForm.jsx";
import { fetchPlan } from "../api/learningPlan.jsx";

export default function LandingPage() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState(
    "Python programming for absolute beginners"
  );
  const [level, setLevel] = useState("beginner");
  const [minutes, setMinutes] = useState(30);
  const [goal, setGoal] = useState(
    "Write simple Python scripts and understand core concepts"
  );

  const [fmtVideo, setFmtVideo] = useState(true);
  const [fmtReading, setFmtReading] = useState(true);
  const [fmtInteractive, setFmtInteractive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formats = useMemo(() => {
    const arr = [];
    if (fmtVideo) arr.push("video");
    if (fmtReading) arr.push("reading");
    if (fmtInteractive) arr.push("interactive");
    return arr.length ? arr : ["video", "reading"];
  }, [fmtVideo, fmtReading, fmtInteractive]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const days = await fetchPlan({
        topic,
        level,
        minutes,
        formats,
        goal,
      });

      navigate("/results", { state: { plan: days } });
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <PlanForm
        topic={topic}
        setTopic={setTopic}
        level={level}
        setLevel={setLevel}
        minutes={minutes}
        setMinutes={setMinutes}
        goal={goal}
        setGoal={setGoal}
        fmtVideo={fmtVideo}
        setFmtVideo={setFmtVideo}
        fmtReading={fmtReading}
        setFmtReading={setFmtReading}
        fmtInteractive={fmtInteractive}
        setFmtInteractive={setFmtInteractive}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </>
  );
}
