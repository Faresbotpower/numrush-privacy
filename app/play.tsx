import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemeColors, fontSize, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/theme/ThemeContext';
import { GameMode, Difficulty, Operation, Problem } from '../src/types';
import { getSettings, getStats, addGameResult, saveDailyResult, saveChallengeResult } from '../src/storage/store';
import { loadSounds, playCorrect, playWrong, playTap, unloadSounds } from '../src/engine/sounds';
import { generateProblem, generateDailyProblems, generateChallengeProblems } from '../src/engine/generator';
import {
  GameState,
  createGameState,
  recordAnswer,
  markProblemStart,
  getAccuracy,
  getGauntletDifficulty,
  toGameResult,
} from '../src/engine/scoring';
import { DIFFICULTY_LABELS } from '../src/engine/difficulty';
import { ProblemDisplay } from '../src/components/ProblemDisplay';
import { AnswerInput } from '../src/components/AnswerInput';
import { NumberPad } from '../src/components/NumberPad';
import { Timer } from '../src/components/Timer';
import { StreakBadge } from '../src/components/StreakBadge';
import { StatsCard } from '../src/components/StatsCard';

type Phase = 'countdown' | 'playing' | 'result';

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function useFadeIn(delay: number, duration: number = 400) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return { opacity, transform: [{ translateY }] };
}

function useFadeOnly(delay: number, duration: number = 400) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return { opacity };
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },

    // Countdown
    countdownContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.lg,
    },
    countdownMode: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    countdownNumber: {
      fontSize: 140,
      fontWeight: '900',
      color: colors.accent,
      fontVariant: ['tabular-nums'],
    },
    countdownHint: {
      fontSize: fontSize.md,
      color: colors.textDim,
    },

    // Top bar
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    backText: {
      fontSize: fontSize.lg,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    scoreChip: {
      flexDirection: 'row',
      alignItems: 'baseline',
      backgroundColor: colors.accentDim,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      gap: 4,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    scoreChipValue: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.accent,
      fontVariant: ['tabular-nums'],
    },
    scoreChipLabel: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.accent,
      opacity: 0.7,
    },

    // Info row
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    infoPill: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    infoText: {
      fontSize: fontSize.xs,
      color: colors.textDim,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    progressText: {
      fontSize: fontSize.xs,
      color: colors.textDim,
      fontWeight: '600',
    },
    doneBtn: {
      backgroundColor: colors.surfaceLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    doneBtnText: {
      fontSize: fontSize.sm,
      color: colors.text,
      fontWeight: '600',
    },

    // Game area
    gameArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xl,
      paddingHorizontal: spacing.lg,
    },

    // Results
    resultContainer: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
      gap: spacing.xl,
    },
    resultHeader: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    resultTitle: {
      fontSize: fontSize.xxl,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -1,
    },
    resultTitleLine: {
      width: 40,
      height: 4,
      backgroundColor: colors.accent,
      borderRadius: 2,
    },
    // New best badge
    newBestContainer: {
      alignItems: 'center',
      marginBottom: -spacing.sm,
    },
    newBestText: {
      fontSize: fontSize.lg,
      fontWeight: '900',
      color: colors.streak,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    resultScoreSection: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    resultScoreLabel: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textDim,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    resultScoreValue: {
      fontSize: 96,
      fontWeight: '900',
      color: colors.accent,
      fontVariant: ['tabular-nums'],
      letterSpacing: -4,
    },
    resultStats: {
      gap: spacing.sm,
    },
    resultRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    resultActions: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    resultBtn: {
      paddingVertical: spacing.md + 2,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    resultBtnPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    playAgainBtn: {
      backgroundColor: colors.accent,
    },
    playAgainText: {
      fontSize: fontSize.md,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    shareBtn: {
      backgroundColor: colors.blueDim,
      borderWidth: 1,
      borderColor: colors.blue + '40',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    shareBtnText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.blue,
    },
    homeBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    homeBtnText: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
}

export default function PlayScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const params = useLocalSearchParams<{
    mode: string;
    difficulty: string;
    operations: string;
    code: string;
  }>();
  const gameMode = (params.mode || 'timed') as GameMode;
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdownNum, setCountdownNum] = useState(3);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isNewBest, setIsNewBest] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsRef = useRef<Awaited<ReturnType<typeof getSettings>> | null>(null);

  // Daily mode state
  const dailyProblemsRef = useRef<Problem[]>([]);
  const dailyIndexRef = useRef(0);

  // Gauntlet per-question timer
  const [questionTime, setQuestionTime] = useState(10);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parse params for difficulty and operations
  const paramDifficulty = (params.difficulty || '') as Difficulty;
  const paramOperations = params.operations
    ? (decodeURIComponent(params.operations).split(',') as Operation[])
    : null;

  // Countdown fade animation
  const countdownOpacity = useRef(new Animated.Value(1)).current;

  // Result screen animations
  const resultHeaderAnim = useFadeIn(100);
  const resultScoreAnim = useFadeIn(200);
  const resultStatsAnim = useFadeIn(300);
  const resultActionsAnim = useFadeIn(500);

  // New best scale animation
  const newBestScale = useRef(new Animated.Value(0)).current;

  // Playing screen animations
  const topBarAnim = useFadeOnly(0, 300);
  const gameAreaAnim = useFadeIn(200);

  // Load sounds + settings
  useEffect(() => {
    getSettings().then((s) => {
      settingsRef.current = s;
      if (s.soundEnabled) loadSounds();
    });

    // Generate daily/challenge problems if needed
    if (gameMode === 'daily') {
      dailyProblemsRef.current = generateDailyProblems(getTodayDateString());
      dailyIndexRef.current = 0;
    } else if (gameMode === 'challenge' && params.code) {
      dailyProblemsRef.current = generateChallengeProblems(params.code);
      dailyIndexRef.current = 0;
    }

    return () => { unloadSounds(); };
  }, []);

  // Countdown before game starts
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownNum((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Animate countdown number change
  useEffect(() => {
    countdownOpacity.setValue(0);
    Animated.timing(countdownOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [countdownNum]);

  const getDifficulty = useCallback((state?: GameState | null): Difficulty => {
    if (gameMode === 'daily' || gameMode === 'challenge') return 'medium';
    if (gameMode === 'gauntlet' && state) {
      return getGauntletDifficulty(state.correct + state.wrong);
    }
    if (gameMode === 'gauntlet') return 'easy';
    if (paramDifficulty && ['easy', 'medium', 'hard'].includes(paramDifficulty)) {
      return paramDifficulty;
    }
    return settingsRef.current?.difficulty || 'easy';
  }, [gameMode, paramDifficulty]);

  const getOperations = useCallback((): Operation[] => {
    if (gameMode === 'daily' || gameMode === 'gauntlet' || gameMode === 'challenge') return ['+', '\u2212', '\u00D7', '\u00F7'];
    if (paramOperations && paramOperations.length > 0) return paramOperations;
    return settingsRef.current?.operations || ['+', '\u2212', '\u00D7', '\u00F7'];
  }, [gameMode, paramOperations]);

  const startGame = useCallback(() => {
    const settings = settingsRef.current!;
    const difficulty = getDifficulty();
    const operations = getOperations();
    const totalProblems = (gameMode === 'daily' || gameMode === 'challenge') ? 20 : 0;
    const state = createGameState(
      gameMode,
      difficulty,
      settings.timedDuration,
      totalProblems
    );
    setGameState(state);

    if (gameMode === 'daily' || gameMode === 'challenge') {
      dailyIndexRef.current = 0;
      setProblem(dailyProblemsRef.current[0]);
    } else {
      setProblem(generateProblem(difficulty, operations));
    }
    setPhase('playing');
  }, [gameMode, getDifficulty, getOperations]);

  // Timer for timed mode
  useEffect(() => {
    if (gameMode !== 'timed' || phase !== 'playing' || !gameState?.isActive)
      return;

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || !prev.isActive) return prev;
        const next = { ...prev, timeLeft: prev.timeLeft - 1 };
        if (next.timeLeft <= 0) {
          next.isActive = false;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameMode, phase, gameState?.isActive]);

  // Per-question timer for gauntlet mode
  useEffect(() => {
    if (gameMode !== 'gauntlet' || phase !== 'playing' || !gameState?.isActive)
      return;

    setQuestionTime(10);
    questionTimerRef.current = setInterval(() => {
      setQuestionTime((prev) => {
        if (prev <= 1) {
          // Time's up — end the game
          setGameState((gs) => gs ? { ...gs, isActive: false } : gs);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [gameMode, phase, gameState?.isActive, problem]);

  // Check if game ended
  useEffect(() => {
    if (gameState && !gameState.isActive && phase === 'playing') {
      endGame();
    }
  }, [gameState?.isActive]);

  const endGame = useCallback(async () => {
    if (!gameState) return;
    setPhase('result');
    if (timerRef.current) clearInterval(timerRef.current);
    const result = toGameResult(gameState);

    // Check for new best before saving
    const prevStats = await getStats();
    let gotNewBest = false;
    if (gameMode === 'timed' && result.score > prevStats.bestTimedScore) {
      gotNewBest = true;
    }
    if (result.streak > prevStats.bestStreak) {
      gotNewBest = true;
    }
    setIsNewBest(gotNewBest);
    if (gotNewBest) {
      newBestScale.setValue(0);
      Animated.sequence([
        Animated.timing(newBestScale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(newBestScale, {
          toValue: 1,
          damping: 8,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    await addGameResult(result);

    // Save daily result
    if (gameMode === 'daily') {
      await saveDailyResult(getTodayDateString(), {
        score: result.correct,
        total: 20,
        accuracy: result.accuracy,
        completed: true,
      });
    }

    // Save challenge result
    if (gameMode === 'challenge' && params.code) {
      await saveChallengeResult({
        code: params.code,
        score: result.correct,
        total: 20,
        accuracy: result.accuracy,
        avgSpeed: result.avgSpeed,
      });
    }
  }, [gameState, gameMode, params.code]);

  const handleSubmit = useCallback(async () => {
    if (!gameState || !problem || !answer || !gameState.isActive) return;
    const settings = settingsRef.current!;

    const userAnswer = parseInt(answer, 10);
    const isCorrect = userAnswer === problem.answer;

    if (isCorrect) {
      setFeedback('correct');
      if (settings.hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (settings.soundEnabled) playCorrect();
    } else {
      setFeedback('wrong');
      if (settings.hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      if (settings.soundEnabled) playWrong();
    }

    const nextState = recordAnswer(gameState, isCorrect);
    setGameState(nextState);

    setTimeout(() => {
      setFeedback('none');
      setAnswer('');
      if (nextState.isActive) {
        if (gameMode === 'daily' || gameMode === 'challenge') {
          const nextIdx = dailyIndexRef.current + 1;
          dailyIndexRef.current = nextIdx;
          if (nextIdx < dailyProblemsRef.current.length) {
            setProblem(dailyProblemsRef.current[nextIdx]);
            setGameState(markProblemStart(nextState));
          }
        } else {
          const difficulty = getDifficulty(nextState);
          const operations = getOperations();
          setProblem(generateProblem(difficulty, operations));
          const markedState = markProblemStart(nextState);
          if (gameMode === 'gauntlet') {
            markedState.difficulty = difficulty;
            setQuestionTime(10);
          }
          setGameState(markedState);
        }
      } else {
        endGame();
      }
    }, 250);
  }, [gameState, problem, answer, endGame, gameMode, getDifficulty, getOperations]);

  const handleNumberPress = useCallback(
    (val: string) => {
      if (answer.length < 7) {
        setAnswer((prev) => prev + val);
        if (settingsRef.current?.soundEnabled) playTap();
      }
    },
    [answer]
  );

  const handleDelete = useCallback(() => {
    setAnswer((prev) => prev.slice(0, -1));
  }, []);

  const restartGame = useCallback(() => {
    setPhase('playing');
    setAnswer('');
    setFeedback('none');
    setIsNewBest(false);
    const settings = settingsRef.current!;
    const difficulty = getDifficulty();
    const operations = getOperations();
    const totalProblems = (gameMode === 'daily' || gameMode === 'challenge') ? 20 : 0;
    const state = createGameState(
      gameMode,
      difficulty,
      settings.timedDuration,
      totalProblems
    );
    setGameState(state);

    if (gameMode === 'daily') {
      dailyProblemsRef.current = generateDailyProblems(getTodayDateString());
      dailyIndexRef.current = 0;
      setProblem(dailyProblemsRef.current[0]);
    } else if (gameMode === 'challenge' && params.code) {
      dailyProblemsRef.current = generateChallengeProblems(params.code);
      dailyIndexRef.current = 0;
      setProblem(dailyProblemsRef.current[0]);
    } else {
      setProblem(generateProblem(difficulty, operations));
    }
  }, [gameMode, getDifficulty, getOperations]);

  const handleShare = useCallback(async () => {
    if (!gameState) return;
    const result = toGameResult(gameState);
    const modeLabel = gameMode === 'timed'
      ? 'Timed Mode'
      : gameMode === 'streak'
      ? 'Streak Mode'
      : gameMode === 'daily'
      ? 'Daily Challenge'
      : gameMode === 'gauntlet'
      ? 'The Gauntlet'
      : gameMode === 'challenge'
      ? 'Challenge'
      : 'Practice Mode';
    const text = gameMode === 'challenge'
      ? `NumRush | Challenge ${params.code || ''}\nScore: ${result.correct}/20 | Accuracy: ${result.accuracy}% | Avg: ${result.avgSpeed}s\nCan you beat me? \uD83C\uDFC1`
      : gameMode === 'daily'
      ? `NumRush | ${modeLabel}\nScore: ${result.correct}/20 | Accuracy: ${result.accuracy}%\nCan you beat me? \uD83D\uDD25`
      : `NumRush | ${modeLabel}\nScore: ${result.score} | Accuracy: ${result.accuracy}% | Streak: ${result.streak}\nCan you beat me? \uD83D\uDD25`;
    try {
      await Share.share({ message: text });
    } catch {}
  }, [gameState, gameMode]);

  // --- COUNTDOWN ---
  if (phase === 'countdown') {
    const modeLabel = gameMode === 'timed'
      ? '\u23F1 Timed'
      : gameMode === 'streak'
      ? '\uD83D\uDD25 Streak'
      : gameMode === 'daily'
      ? '\uD83C\uDFC6 Daily'
      : gameMode === 'gauntlet'
      ? '\u2694\uFE0F The Gauntlet'
      : gameMode === 'challenge'
      ? '\uD83C\uDFC1 Challenge'
      : '\uD83E\uDDE0 Practice';

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownMode}>{modeLabel}</Text>
          <Animated.Text
            style={[styles.countdownNumber, { opacity: countdownOpacity }]}
          >
            {countdownNum}
          </Animated.Text>
          <Text style={styles.countdownHint}>Get ready...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- RESULT ---
  if (phase === 'result' && gameState) {
    const result = toGameResult(gameState);
    const title =
      gameMode === 'timed'
        ? "Time's Up!"
        : gameMode === 'streak'
        ? 'Streak Over!'
        : gameMode === 'daily'
        ? 'Challenge Complete!'
        : gameMode === 'gauntlet'
        ? 'Gauntlet Over!'
        : gameMode === 'challenge'
        ? 'Challenge Complete!'
        : 'Session Done!';

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Animated.View style={[styles.resultHeader, resultHeaderAnim]}>
            <Text style={styles.resultTitle}>{title}</Text>
            <View style={styles.resultTitleLine} />
          </Animated.View>

          {/* New Best Badge */}
          {isNewBest && (
            <Animated.View
              style={[
                styles.newBestContainer,
                { transform: [{ scale: newBestScale }] },
              ]}
            >
              <Text style={styles.newBestText}>NEW BEST!</Text>
            </Animated.View>
          )}

          <Animated.View style={[styles.resultScoreSection, resultScoreAnim]}>
            <Text style={styles.resultScoreLabel}>
              {(gameMode === 'daily' || gameMode === 'challenge') ? 'CORRECT' : 'SCORE'}
            </Text>
            <Text style={styles.resultScoreValue}>
              {(gameMode === 'daily' || gameMode === 'challenge') ? `${result.correct}` : result.score}
            </Text>
            {(gameMode === 'daily' || gameMode === 'challenge') && (
              <Text style={[styles.resultScoreLabel, { marginTop: -spacing.sm }]}>
                OUT OF 20
              </Text>
            )}
          </Animated.View>

          <Animated.View style={[styles.resultStats, resultStatsAnim]}>
            <View style={styles.resultRow}>
              <StatsCard
                label="Correct"
                value={result.correct}
                color={colors.correct}
              />
              <StatsCard
                label="Wrong"
                value={result.wrong}
                color={colors.wrong}
              />
            </View>
            <View style={styles.resultRow}>
              <StatsCard
                label="Accuracy"
                value={`${result.accuracy}%`}
                color={result.accuracy >= 80 ? colors.correct : colors.textSecondary}
              />
              <StatsCard
                label="Best Streak"
                value={result.streak}
                color={colors.streak}
              />
            </View>
            <View style={styles.resultRow}>
              <StatsCard
                label="Avg Speed"
                value={`${result.avgSpeed}s`}
                color={colors.blue}
              />
              <StatsCard
                label="Duration"
                value={`${result.duration}s`}
                color={colors.textSecondary}
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.resultActions, resultActionsAnim]}>
            <Pressable
              style={({ pressed }) => [
                styles.resultBtn,
                styles.playAgainBtn,
                pressed && styles.resultBtnPressed,
              ]}
              onPress={restartGame}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.resultBtn,
                styles.shareBtn,
                pressed && styles.resultBtnPressed,
              ]}
              onPress={handleShare}
            >
              <Text style={styles.shareBtnText}>{'\u{1F4E4}'} Share</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.resultBtn,
                styles.homeBtn,
                pressed && styles.resultBtnPressed,
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.homeBtnText}>Home</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (!gameState || !problem) return null;

  // --- PLAYING ---
  const showProgress = (gameMode === 'daily' || gameMode === 'challenge')
    ? `${gameState.correct + gameState.wrong}/${gameState.totalProblems}`
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top bar */}
        <Animated.View style={[styles.topBar, topBarAnim]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>{'\u2190'}</Text>
          </Pressable>

          <StreakBadge streak={gameState.currentStreak} />

          {gameMode === 'timed' ? (
            <Timer seconds={gameState.timeLeft} />
          ) : gameMode === 'gauntlet' ? (
            <Timer seconds={questionTime} />
          ) : (
            <View style={styles.scoreChip}>
              <Text style={styles.scoreChipValue}>{gameState.correct}</Text>
              <Text style={styles.scoreChipLabel}>
                {(gameMode === 'daily' || gameMode === 'challenge') ? '/20' : 'pts'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Info row */}
        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Text style={styles.infoText}>
              {DIFFICULTY_LABELS[gameState.difficulty]}
            </Text>
          </View>
          {showProgress ? (
            <Text style={styles.progressText}>{showProgress}</Text>
          ) : (
            <Text style={styles.infoText}>
              {getAccuracy(gameState)}% accuracy
            </Text>
          )}
          {gameMode === 'practice' && (
            <Pressable style={styles.doneBtn} onPress={endGame}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          )}
        </View>

        {/* Game Area */}
        <Animated.View
          style={[styles.gameArea, gameAreaAnim]}
        >
          <ProblemDisplay problem={problem.displayStr} feedback={feedback} />
          <AnswerInput value={answer} feedback={feedback} />
        </Animated.View>

        {/* Number Pad */}
        <NumberPad
          onPress={handleNumberPress}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={!gameState.isActive}
        />
      </View>
    </SafeAreaView>
  );
}
