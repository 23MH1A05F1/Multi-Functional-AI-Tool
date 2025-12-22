import React from "react";
import { ResumeModel } from "../models/resumeModel";
import { resumeToPlainText } from "../utils/text";

type Props = { resume: ResumeModel };

export function Dashboard({ resume }: Props) {
  const plain = resumeToPlainText(resume);
  const words = (plain.match(/[a-zA-Z]+/g) || []).length;
  const bullets = (plain.match(/\- /g) || []).length;

  return (
    <div className="dashboard">
      <div className="dash-card">
        <div className="dash-title">Builder Health</div>
        <div className="dash-kv"><span>Words</span><span>{words}</span></div>
        <div className="dash-kv"><span>Sections</span><span>{countNonEmpty(resume)}</span></div>
      </div>
      <div className="dash-card">
        <div className="dash-title">Output</div>
        <div className="dash-kv"><span>Export</span><span>.txt / .json</span></div>
        <div className="dash-kv"><span>Mode</span><span>Offline (no API)</span></div>
      </div>
    </div>
  );
}

function countNonEmpty(r: ResumeModel) {
  let c = 0;
  if (r.summary.trim()) c++;
  if (r.skills.length) c++;
  if (r.experience.length) c++;
  if (r.projects.length) c++;
  if (r.education.length) c++;
  if (r.certs.length) c++;
  return c;
}
