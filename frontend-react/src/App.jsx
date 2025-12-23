import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages_all/LandingPage.jsx";
import ResultsPage from "./pages_all/ResultsPage.jsx";
import HomePage from "./pages_all/HomePage.jsx";

export default function App() {
  return (
    <div className="page">
      <div className="container">
        <Routes>
          {/* Landing / entry page */}
          <Route path="/" element={<LandingPage />} />

          {/* Results page (generated plan) */}
          <Route path="/results" element={<ResultsPage />} />

          {/* User home / dashboard */}
          <Route path="/home" element={<HomePage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
