import React from "react";
import { ResumeModel } from "../models/resumeModel";
import { resumeToPlainText } from "../utils/text";

type Props = { resume: ResumeModel; onChange: (r: ResumeModel) => void };

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="field">
      <div className="field-label">{label}</div>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function Builder({ resume, onChange }: Props) {
  const update = (patch: Partial<ResumeModel>) => onChange({ ...resume, ...patch });

  const download = (kind: "txt" | "json") => {
    const blob = kind === "json"
      ? new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" })
      : new Blob([resumeToPlainText(resume)], { type: "text/plain" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = kind === "json" ? "resume.json" : "resume.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Resume Builder</h2>
        <div className="panel-actions">
          <button className="btn" onClick={() => download("txt")}>Download .txt</button>
          <button className="btn secondary" onClick={() => download("json")}>Download .json</button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Basics</h3>
          <Input label="Name" value={resume.basics.name} onChange={(v) => update({ basics: { ...resume.basics, name: v } })} />
          <Input label="Role / Title" value={resume.basics.role} onChange={(v) => update({ basics: { ...resume.basics, role: v } })} />
          <Input label="Email" value={resume.basics.email} onChange={(v) => update({ basics: { ...resume.basics, email: v } })} />
          <Input label="Phone" value={resume.basics.phone} onChange={(v) => update({ basics: { ...resume.basics, phone: v } })} />
          <Input label="Location" value={resume.basics.location} onChange={(v) => update({ basics: { ...resume.basics, location: v } })} />
          <Input label="LinkedIn" value={resume.basics.linkedin} onChange={(v) => update({ basics: { ...resume.basics, linkedin: v } })} />
          <Input label="GitHub" value={resume.basics.github} onChange={(v) => update({ basics: { ...resume.basics, github: v } })} />
        </div>

        <div className="card">
          <h3>Summary</h3>
          <label className="field">
            <div className="field-label">Professional Summary</div>
            <textarea className="textarea" value={resume.summary} onChange={(e) => update({ summary: e.target.value })} />
          </label>
        </div>

        <div className="card">
          <h3>Skills (comma separated)</h3>
          <label className="field">
            <div className="field-label">Skills</div>
            <input
              className="input"
              value={resume.skills.join(", ")}
              onChange={(e) => update({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="e.g., React, Node.js, PostgreSQL"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
