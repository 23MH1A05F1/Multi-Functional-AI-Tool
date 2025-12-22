import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("ats_theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  useEffect(() => {
    localStorage.setItem("ats_theme", theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  };
}
