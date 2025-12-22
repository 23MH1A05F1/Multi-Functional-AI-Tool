import React, { useMemo, useState } from "react";
import { ResumeModel } from "../models/resumeModel";
import { runAts } from "../utils/scoring";
import { resumeToPlainText } from "../utils/text";

type Props = { resume: ResumeModel };

export function AtsPanel({ resume }: Props) {
  const [jd, setJd] = useState("");
  const [show, setShow] = useState(false);

  const result = useMemo(() => (jd.trim() ? runAts(resume, jd) : null), [resume, jd]);

  const highlighted = useMemo(() => {
    if (!result) return "";
    let text = resumeToPlainText(resume);
    for (const w of result.matched) {
      const re = new RegExp(`\\b${escapeRegExp(w)}\\b`, "gi");
      text = text.replace(re, (m) => `[[[${m}]]]`);
    }
    return text
      .split("\n")
      .map((line) => line.replace(/\[\[\[(.*?)\]\]\]/g, "<mark>$1</mark>"))
      .join("\n");
  }, [result, resume]);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>ATS Checker</h2>
        <div className="panel-actions">
          <button className="btn" onClick={() => setShow(true)} disabled={!jd.trim()}>
            Analyze
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Job Description (paste)</h3>
          <textarea className="textarea" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the JD here..." />
        </div>

        {show && result && (
          <>
            <div className="card">
              <h3>Overall Score</h3>
              <div className="score">{result.total}/100</div>
              <ul className="list">
                {result.breakdown.map((b) => (
                  <li key={b.label}>
                    <div className="kv"><span className="k">{b.label}</span><span className="v">{b.score}/{b.outOf}</span></div>
                    <div className="small">{b.detail}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3>Missing Keywords (top)</h3>
              <ul className="taglist">
                {result.missing.slice(0, 30).map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>

            <div className="card">
              <h3>Extracted Skills (from your resume)</h3>
              <ul className="taglist">
                {result.extracted.skills.slice(0, 30).map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>

            <div className="card">
              <h3>Keyword Highlighting (your resume)</h3>
              <div className="mono" dangerouslySetInnerHTML={{ __html: highlighted }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
