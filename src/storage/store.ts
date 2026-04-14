import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Stats,
  Settings,
  GameResult,
  DEFAULT_STATS,
  DEFAULT_SETTINGS,
} from '../types';

const KEYS = {
  stats: '@numrush_stats',
  settings: '@numrush_settings',
};

export async function getStats(): Promise<Stats> {
  const raw = await AsyncStorage.getItem(KEYS.stats);
  if (!raw) return { ...DEFAULT_STATS };
  return JSON.parse(raw);
}

export async function saveStats(stats: Stats): Promise<void> {
  await AsyncStorage.setItem(KEYS.stats, JSON.stringify(stats));
}

export async function addGameResult(result: GameResult): Promise<Stats> {
  const stats = await getStats();
  stats.totalSolved += result.correct + result.wrong;
  stats.totalCorrect += result.correct;
  stats.totalWrong += result.wrong;
  stats.gamesPlayed += 1;
  if (result.streak > stats.bestStreak) stats.bestStreak = result.streak;
  if (result.mode === 'timed' && result.score > stats.bestTimedScore) {
    stats.bestTimedScore = result.score;
  }
  stats.history = [result, ...stats.history].slice(0, 100);
  await saveStats(stats);
  return stats;
}

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return { ...DEFAULT_SETTINGS };
  const parsed = JSON.parse(raw);
  // Ensure theme field exists for older stored settings
  if (!parsed.theme) parsed.theme = 'dark';
  return parsed;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function resetStats(): Promise<void> {
  await AsyncStorage.setItem(KEYS.stats, JSON.stringify(DEFAULT_STATS));
}

// Daily challenge persistence
function dailyKey(date: string): string {
  return `@numrush_daily_${date}`;
}

export interface DailyResult {
  score: number;
  total: number;
  accuracy: number;
  completed: boolean;
}

export async function getDailyResult(date: string): Promise<DailyResult | null> {
  const raw = await AsyncStorage.getItem(dailyKey(date));
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function saveDailyResult(date: string, result: DailyResult): Promise<void> {
  await AsyncStorage.setItem(dailyKey(date), JSON.stringify(result));
}

// Challenge persistence
export interface ChallengeResult {
  code: string;
  score: number;
  total: number;
  accuracy: number;
  avgSpeed: number;
}

function challengeKey(code: string): string {
  return `@numrush_challenge_${code.toUpperCase()}`;
}

export async function getChallengeResult(code: string): Promise<ChallengeResult | null> {
  const raw = await AsyncStorage.getItem(challengeKey(code));
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function saveChallengeResult(result: ChallengeResult): Promise<void> {
  await AsyncStorage.setItem(challengeKey(result.code), JSON.stringify(result));
}
