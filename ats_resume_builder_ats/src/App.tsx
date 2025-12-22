import React, { useEffect, useMemo, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Builder } from "./components/Builder";
import { AtsPanel } from "./components/AtsPanel";
import { useTheme } from "./hooks/useTheme";
import { ResumeModel, defaultResume } from "./models/resumeModel";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"build" | "ats">("build");
  const [resume, setResume] = useState<ResumeModel>(() => defaultResume);

  // keep body class in sync (for css variables)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo">ATS</div>
          <div>
            <div className="title">Resume Builder + ATS</div>
            <div className="subtitle">Offline · React · Dashboard</div>
          </div>
        </div>

        <div className="top-actions">
          <button className="tab" onClick={() => setActiveTab("build")} aria-pressed={activeTab==="build"}>
            Resume Builder
          </button>
          <button className="tab" onClick={() => setActiveTab("ats")} aria-pressed={activeTab==="ats"}>
            ATS Checker
          </button>
          <button className="btn" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>
      </header>

      <main className="main">
        {activeTab === "build" ? (
          <Builder resume={resume} onChange={setResume} />
        ) : (
          <AtsPanel resume={resume} />
        )}
      </main>

      <aside className="side">
        <Dashboard resume={resume} />
      </aside>
    </div>
  );
}
