import { ResumeModel } from "../models/resumeModel";
import { normalize, tokenizeWords, unique } from "./text";
import { SKILLS } from "../data/skills";

export type AtsResult = {
  total: number;
  breakdown: { label: string; score: number; outOf: number; detail: string }[];
  matched: string[];
  missing: string[];
  extracted: { skills: string[]; keywords: string[] };
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.min(hi, Math.max(lo, n));
}

function scoreKeywords(resumeText: string, jdText: string) {
  const jdTokens = unique(tokenizeWords(jdText)).filter((t) => t.length >= 2);
  const resume = normalize(resumeText);

  const matched = jdTokens.filter((t) => resume.includes(t));
  const missing = jdTokens.filter((t) => !resume.includes(t));

  const coverage = jdTokens.length ? (matched.length / jdTokens.length) * 100 : 0;
  return { matched, missing, coverage, jdTokens };
}

function scoreStructure(resumeText: string) {
  const text = normalize(resumeText);
  let points = 0;
  let outOf = 20;

  if (text.includes("experience")) points += 6;
  if (text.includes("education")) points += 4;
  if (text.includes("projects")) points += 4;
  if (text.includes("skills")) points += 3;
  if (text.includes("cert")) points += 3;

  return { score: points, outOf, detail: "Section presence (Experience, Education, Projects, Skills, Certifications)." };
}

function scoreImpact(resumeText: string) {
  const text = normalize(resumeText);
  let points = 0;
  let outOf = 25;

  const impactSignals = [
    "%", "increased", "decreased", "reduced", "improved", "boosted",
    "cut", "saved", "accelerated", "optimized", "enhanced", "growth"
  ];
  const quantified = /(\d{1,3}(\.\d+)?%|\d{2,5})/.test(text);

  impactSignals.forEach((s) => { if (text.includes(s)) points += 2; });
  if (quantified) points += 8;

  return { score: Math.min(points, outOf), outOf, detail: "Quantified outcomes and business impact signals (percentages, numbers, outcome verbs)." };
}

function scoreReadability(resumeText: string) {
  const words = tokenizeWords(resumeText);
  const sentences = (resumeText.match(/[.!?]+/g) || []).length || 1;
  const avgWords = words.length / sentences;

  let score = 20;
  let outOf = 20;

  if (avgWords > 30) score -= 6;
  if (avgWords < 6) score -= 3;

  return { score: clamp(score), outOf, detail: "Readable sentence length (avoid overly long or fragmentary lines)." };
}

function extractSkills(resumeText: string) {
  const text = normalize(resumeText);
  const found = SKILLS.filter((s) => text.includes(s.toLowerCase()));
  return unique(found).slice(0, 120);
}

export function runAts(resume: ResumeModel, jd: string): AtsResult {
  const resumeText = `${resume.summary}
${resume.skills.join(", ")}
${JSON.stringify(resume)}`;

  const kw = scoreKeywords(resumeText, jd);
  const struct = scoreStructure(resumeText);
  const impact = scoreImpact(resumeText);
  const readability = scoreReadability(resumeText);

  const total = clamp(
    (kw.coverage * 0.45) + (struct.score / struct.outOf) * 20 + (impact.score / impact.outOf) * 20 + (readability.score / readability.outOf) * 15
  );

  return {
    total: Number(total.toFixed(1)),
    breakdown: [
      { label: "JD Keyword Coverage", score: Number(kw.coverage.toFixed(1)), outOf: 100, detail: "How many role-specific terms appear in your resume." },
      { label: "Structure & Sections", score: struct.score, outOf: struct.outOf, detail: struct.detail },
      { label: "Impact & Quantification", score: impact.score, outOf: impact.outOf, detail: impact.detail },
      { label: "Readability", score: readability.score, outOf: readability.outOf, detail: readability.detail }
    ],
    matched: kw.matched.slice(0, 80),
    missing: kw.missing.slice(0, 80),
    extracted: { skills: extractSkills(resumeText), keywords: kw.jdTokens.slice(0, 120) }
  };
}
