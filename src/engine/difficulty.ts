import { Difficulty } from '../types';

export interface DifficultyRange {
  min: number;
  max: number;
  divMax: number; // max result for division to keep answers clean
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyRange> = {
  easy: { min: 1, max: 12, divMax: 12 },
  medium: { min: 10, max: 99, divMax: 20 },
  hard: { min: 100, max: 999, divMax: 30 },
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: 'Single digits (1-12)',
  medium: 'Double digits (10-99)',
  hard: 'Triple digits (100-999)',
};
