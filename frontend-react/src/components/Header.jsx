import { Sparkles, BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="header">
      <h1 className="title">
        <Sparkles size={28} />
        AI Learning Tool
      </h1>

      <p className="subtitle">
        <BookOpen size={18} />
        Generate a 30-day learning plan with real resources
      </p>
    </header>
  );
}
