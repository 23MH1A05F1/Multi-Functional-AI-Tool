export type ResumeModel = {
  basics: {
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  skills: string[];
  experience: { company: string; role: string; start: string; end: string; bullets: string[] }[];
  projects: { name: string; tech: string; impact: string; bullets: string[] }[];
  education: { school: string; degree: string; year: string }[];
  certs: { name: string; issuer: string; year: string }[];
};

export const defaultResume: ResumeModel = {
  basics: {
    name: "Your Name",
    role: "Role / Title",
    email: "name@email.com",
    phone: "0000000000",
    location: "City, Country",
    linkedin: "",
    github: ""
  },
  summary: "One concise paragraph describing your value, role focus, and measurable impact.",
  skills: ["JavaScript", "React", "Node.js", "SQL"],
  experience: [
    {
      company: "Company Name",
      role: "Job Title",
      start: "MM YYYY",
      end: "Present",
      bullets: [
        "Delivered improvements that increased a key KPI (e.g., conversion, performance).",
        "Collaborated with cross-functional teams to ship features on schedule."
      ]
    }
  ],
  projects: [
    {
      name: "Project Name",
      tech: "React, Node.js, PostgreSQL",
      impact: "Improved user task completion and reduced manual work.",
      bullets: [
        "Built end-to-end workflow (frontend + API + database).",
        "Implemented role-based access and analytics tracking."
      ]
    }
  ],
  education: [{ school: "University", degree: "B.Tech / BSc / BE", year: "YYYY" }],
  certs: [{ name: "Certification Name", issuer: "Issuer", year: "YYYY" }]
};
