// app/context/ThemeContext.tsx

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
    }),
    [darkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Alias so you can also use BloomThemeProvider if you want
export const BloomThemeProvider = ThemeProvider;

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};
