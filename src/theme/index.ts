export type ThemeColors = typeof darkColors;

export const darkColors = {
  bg: '#050505',
  bgElevated: '#0E0E0E',
  surface: '#151515',
  surfaceLight: '#222222',
  surfaceBorder: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textDim: '#666666',
  textMuted: '#444444',
  accent: '#FF6B35',
  accentLight: '#FF8F66',
  accentDim: '#FF6B3520',
  accentBorder: '#FF6B3540',
  correct: '#34C759',
  correctDim: '#34C75918',
  correctBorder: '#34C75940',
  wrong: '#FF3B30',
  wrongDim: '#FF3B3018',
  wrongBorder: '#FF3B3040',
  streak: '#FFD60A',
  streakDim: '#FFD60A18',
  streakBorder: '#FFD60A40',
  blue: '#007AFF',
  blueDim: '#007AFF20',
};

export const lightColors: ThemeColors = {
  bg: '#F5F5F7',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F0F0F2',
  surfaceBorder: '#E0E0E2',
  text: '#1A1A1A',
  textSecondary: '#555555',
  textDim: '#888888',
  textMuted: '#BBBBBB',
  accent: '#FF6B35',
  accentLight: '#FF8F66',
  accentDim: '#FF6B3520',
  accentBorder: '#FF6B3540',
  correct: '#34C759',
  correctDim: '#34C75918',
  correctBorder: '#34C75940',
  wrong: '#FF3B30',
  wrongDim: '#FF3B3018',
  wrongBorder: '#FF3B3040',
  streak: '#FFD60A',
  streakDim: '#FFD60A18',
  streakBorder: '#FFD60A40',
  blue: '#007AFF',
  blueDim: '#007AFF20',
};

// Keep a default export for backwards-compat during migration
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 17,
  lg: 22,
  xl: 32,
  xxl: 48,
  hero: 64,
  problem: 80,
};

export const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }),
};
