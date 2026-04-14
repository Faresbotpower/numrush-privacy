export type Operation = '+' | '−' | '×' | '÷';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'timed' | 'streak' | 'practice' | 'daily' | 'gauntlet' | 'challenge';

export interface Problem {
  a: number;
  b: number;
  operation: Operation;
  answer: number;
  displayStr: string;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  operations: Operation[];
  timedDuration: number; // seconds, for timed mode
}

export interface GameResult {
  mode: GameMode;
  difficulty: Difficulty;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
  accuracy: number;
  duration: number; // seconds
  avgSpeed: number; // seconds per problem, 1 decimal
  date: string; // ISO string
}

export interface Stats {
  totalSolved: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  bestTimedScore: number;
  gamesPlayed: number;
  history: GameResult[];
}

export interface Settings {
  difficulty: Difficulty;
  operations: Operation[];
  timedDuration: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: 'dark' | 'light';
}

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'easy',
  operations: ['+', '−', '×', '÷'],
  timedDuration: 60,
  soundEnabled: true,
  hapticEnabled: true,
  theme: 'dark',
};

export const DEFAULT_STATS: Stats = {
  totalSolved: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
  bestTimedScore: 0,
  gamesPlayed: 0,
  history: [],
};
