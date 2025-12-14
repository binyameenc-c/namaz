import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeColor = "emerald" | "blue" | "purple" | "orange" | "red" | "pink";

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  changeAdminPin: (currentPin: string, newPin: string) => boolean;
  verifyPin: (pin: string) => boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS: Record<ThemeColor, { primary: string; primaryForeground: string }> = {
  emerald: { primary: "142.1 76.2% 36.3%", primaryForeground: "355.7 100% 97.3%" },
  blue: { primary: "217.2 91.2% 59.8%", primaryForeground: "0 0% 100%" },
  purple: { primary: "262.1 83.3% 57.8%", primaryForeground: "0 0% 100%" },
  orange: { primary: "24.6 95% 53.1%", primaryForeground: "0 0% 100%" },
  red: { primary: "0 84.2% 60.2%", primaryForeground: "0 0% 100%" },
  pink: { primary: "330.4 81.2% 60.4%", primaryForeground: "0 0% 100%" },
};

const isBrowser = typeof window !== "undefined";

function getStoredPin(): string {
  if (!isBrowser) return "1234";
  return localStorage.getItem("caliph-admin-pin") || "1234";
}

function getStoredTheme(): ThemeColor {
  if (!isBrowser) return "emerald";
  const saved = localStorage.getItem("caliph-theme-color");
  return (saved as ThemeColor) || "emerald";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("emerald");
  const [pinHash, setPinHash] = useState<string>("1234");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setThemeColorState(getStoredTheme());
    setPinHash(getStoredPin());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !isBrowser) return;
    localStorage.setItem("caliph-theme-color", themeColor);
    const colors = THEME_COLORS[themeColor];
    document.documentElement.style.setProperty("--primary", colors.primary);
    document.documentElement.style.setProperty("--primary-foreground", colors.primaryForeground);
  }, [themeColor, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !isBrowser) return;
    localStorage.setItem("caliph-admin-pin", pinHash);
  }, [pinHash, isInitialized]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  const changeAdminPin = (currentPin: string, newPin: string): boolean => {
    if (currentPin !== pinHash) {
      return false;
    }
    setPinHash(newPin);
    return true;
  };

  const verifyPin = (pin: string): boolean => {
    return pin === pinHash;
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, changeAdminPin, verifyPin }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { THEME_COLORS };
export type { ThemeColor };
