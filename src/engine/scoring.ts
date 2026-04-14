import { GameMode, GameResult, Difficulty } from '../types';

export interface GameState {
  mode: GameMode;
  difficulty: Difficulty;
  correct: number;
  wrong: number;
  currentStreak: number;
  bestStreak: number;
  startTime: number;
  timeLeft: number; // for timed mode
  isActive: boolean;
  problemStartTime: number;
  totalSolveTime: number;
  totalProblems: number; // for daily mode (total to solve)
  questionTimeLeft: number; // for gauntlet mode (per-question timer)
}

export function createGameState(
  mode: GameMode,
  difficulty: Difficulty,
  timedDuration: number,
  totalProblems: number = 0
): GameState {
  return {
    mode,
    difficulty,
    correct: 0,
    wrong: 0,
    currentStreak: 0,
    bestStreak: 0,
    startTime: Date.now(),
    timeLeft: mode === 'timed' ? timedDuration : 0,
    isActive: true,
    problemStartTime: Date.now(),
    totalSolveTime: 0,
    totalProblems,
    questionTimeLeft: mode === 'gauntlet' ? 10 : 0,
  };
}

export function markProblemStart(state: GameState): GameState {
  return { ...state, problemStartTime: Date.now() };
}

export function recordAnswer(state: GameState, isCorrect: boolean): GameState {
  if (!state.isActive) return state;

  const now = Date.now();
  const elapsed = (now - state.problemStartTime) / 1000;

  const next = { ...state };
  next.totalSolveTime += elapsed;
  next.problemStartTime = now;

  if (isCorrect) {
    next.correct += 1;
    next.currentStreak += 1;
    if (next.currentStreak > next.bestStreak) {
      next.bestStreak = next.currentStreak;
    }
  } else {
    next.wrong += 1;
    next.currentStreak = 0;
    if (state.mode === 'streak' || state.mode === 'gauntlet') {
      next.isActive = false;
    }
  }

  // Daily mode: end after all problems answered
  if (state.mode === 'daily' && state.totalProblems > 0) {
    if (next.correct + next.wrong >= state.totalProblems) {
      next.isActive = false;
    }
  }

  return next;
}

export function getGauntletDifficulty(answered: number): Difficulty {
  if (answered < 5) return 'easy';
  if (answered < 12) return 'medium';
  return 'hard';
}

export function getScore(state: GameState): number {
  return state.correct;
}

export function getAccuracy(state: GameState): number {
  const total = state.correct + state.wrong;
  if (total === 0) return 0;
  return Math.round((state.correct / total) * 100);
}

export function toGameResult(state: GameState): GameResult {
  const duration = Math.round((Date.now() - state.startTime) / 1000);
  const totalAnswered = state.correct + state.wrong;
  const avgSpeed = totalAnswered > 0
    ? Math.round((state.totalSolveTime / totalAnswered) * 10) / 10
    : 0;
  return {
    mode: state.mode,
    difficulty: state.difficulty,
    score: getScore(state),
    correct: state.correct,
    wrong: state.wrong,
    streak: state.bestStreak,
    accuracy: getAccuracy(state),
    duration,
    avgSpeed,
    date: new Date().toISOString(),
  };
}
