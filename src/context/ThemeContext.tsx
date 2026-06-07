import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeName = "dark" | "light" | "ocean" | "sakura" | "cyber";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("app-theme") as ThemeName | null;
    return saved || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light", "ocean", "sakura", "cyber");
    root.classList.add(theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  return useContext(ThemeContext);
}
