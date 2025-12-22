import { ResumeModel } from "../models/resumeModel";

export function resumeToPlainText(r: ResumeModel): string {
  const parts: string[] = [];

  parts.push(`${r.basics.name} ${r.basics.role} ${r.basics.location}`);
  parts.push(`${r.basics.email} ${r.basics.phone} ${r.basics.linkedin} ${r.basics.github}`);
  parts.push(r.summary);

  parts.push("Skills: " + r.skills.join(", "));

  r.experience.forEach((e) => {
    parts.push(`${e.role} at ${e.company} ${e.start} ${e.end}`);
    parts.push(...e.bullets);
  });

  r.projects.forEach((p) => {
    parts.push(`${p.name} ${p.tech} ${p.impact}`);
    parts.push(...p.bullets);
  });

  r.education.forEach((e) => parts.push(`${e.degree} ${e.school} ${e.year}`));
  r.certs.forEach((c) => parts.push(`${c.name} ${c.issuer} ${c.year}`));

  return parts.join("
");
}

export function normalize(s: string): string {
  return (s || "").toLowerCase();
}

export function tokenizeWords(s: string): string[] {
  const m = s.match(/[a-zA-Z][a-zA-Z\+\#\.]*/g) || [];
  return m.map((w) => w.toLowerCase());
}

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
