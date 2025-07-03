declare module "next-themes" {
  import * as React from "react";

  export interface ThemeProviderProps {
    children?: React.ReactNode;
    attribute?: "class" | "style" | "data-theme";
    defaultTheme?: string;
    enableSystem?: boolean;
    storageKey?: string;
    themes?: string[];
  }

  export const ThemeProvider: React.ComponentType<ThemeProviderProps>;

  export interface UseThemeProps {
    themes: string[];
    systemTheme?: string;
    resolvedTheme?: string;
    theme?: string;
    setTheme: (theme?: string) => void;
  }

  export function useTheme(): UseThemeProps;
}
