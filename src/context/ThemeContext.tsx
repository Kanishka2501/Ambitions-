import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode, ThemePalette } from '../types/index.js';

export interface ThemeOption {
  id: ThemePalette;
  name: string;
  description: string;
  primaryColor: string;
  accentBg: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'lavender-purple',
    name: 'Lavender & Purple',
    description: 'Celestial Northstar signature with regal violet and deep space tones',
    primaryColor: '#a855f7',
    accentBg: '#120e24',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    description: 'Minimalist obsidian canvas with precise electric cyan accents',
    primaryColor: '#38bdf8',
    accentBg: '#0c1017',
  },
  {
    id: 'clean-silver',
    name: 'Clean White & Silver',
    description: 'Architectural monochrome with titanium and platinum clarity',
    primaryColor: '#94a3b8',
    accentBg: '#15181e',
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink & Rose',
    description: 'Warm quartz and rose dawn for calm, grounded discipline',
    primaryColor: '#f472b6',
    accentBg: '#1e1017',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Deep marine navy paired with crisp horizon azure',
    primaryColor: '#0284c7',
    accentBg: '#0b1827',
  },
  {
    id: 'cream-gold',
    name: 'Warm Cream & Gold',
    description: 'Classic luxury editorial parchment with solar amber brilliance',
    primaryColor: '#ca8a04',
    accentBg: '#1e1910',
  },
  {
    id: 'forest-green',
    name: 'Forest Emerald',
    description: 'Grounded pine evergreen and vibrant moss growth accents',
    primaryColor: '#16a34a',
    accentBg: '#0d1e13',
  },
];

interface ThemeContextType {
  themePalette: ThemePalette;
  setThemePalette: (palette: ThemePalette) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  currentThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePalette, setThemePaletteState] = useState<ThemePalette>(() => {
    return (localStorage.getItem('northstar_theme_palette') as ThemePalette) || 'lavender-purple';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('northstar_theme_mode') as ThemeMode) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themePalette);
    localStorage.setItem('northstar_theme_palette', themePalette);
  }, [themePalette]);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', themeMode);
    localStorage.setItem('northstar_theme_mode', themeMode);
  }, [themeMode]);

  const setThemePalette = (palette: ThemePalette) => {
    setThemePaletteState(palette);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleThemeMode = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentThemeOption =
    THEME_OPTIONS.find((t) => t.id === themePalette) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        themePalette,
        setThemePalette,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        currentThemeOption,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
