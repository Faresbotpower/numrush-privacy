import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  Share,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, fontSize, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/theme/ThemeContext';
import { getStats, getSettings, getDailyResult, DailyResult } from '../src/storage/store';
import { Stats, DEFAULT_STATS, GameMode, Difficulty, Operation } from '../src/types';
import { DIFFICULTY_LABELS, DIFFICULTY_DESC } from '../src/engine/difficulty';
import { generateChallengeCode } from '../src/engine/generator';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const OPERATIONS: { key: Operation; label: string; symbol: string }[] = [
  { key: '+', label: 'Add', symbol: '+' },
  { key: '\u2212', label: 'Sub', symbol: '\u2212' },
  { key: '\u00D7', label: 'Mul', symbol: '\u00D7' },
  { key: '\u00F7', label: 'Div', symbol: '\u00F7' },
];

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

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTodayReadable(): string {
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    topNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.xs,
    },
    topNavRight: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    topNavBtn: {
      width: 42,
      height: 42,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    topNavBtnPressed: {
      backgroundColor: colors.surfaceLight,
    },
    topNavIcon: {
      fontSize: 18,
    },
    header: {
      alignItems: 'center',
      paddingTop: spacing.md,
      gap: spacing.xs,
    },
    title: {
      fontSize: fontSize.hero,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: -2,
    },
    titleAccent: {
      width: 48,
      height: 4,
      backgroundColor: colors.accent,
      borderRadius: 2,
      marginTop: -4,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: colors.textDim,
      fontWeight: '500',
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginTop: spacing.xs,
    },
    quickStats: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    statValue: {
      fontSize: fontSize.xl,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
      textAlign: 'center',
    },
    statLabel: {
      fontSize: fontSize.xs,
      color: colors.textDim,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    statDivider: {
      width: 1,
      height: 36,
      backgroundColor: colors.surfaceBorder,
    },
    modes: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    // Daily challenge card
    dailyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md + 2,
      gap: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.accentBorder,
    },
    dailyCardPressed: {
      backgroundColor: colors.surfaceLight,
      transform: [{ scale: 0.98 }],
    },
    dailyCardCompleted: {
      borderColor: colors.correctBorder,
    },
    dailyIconBox: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: colors.accentDim,
      borderColor: colors.accentBorder,
    },
    dailyIconBoxCompleted: {
      backgroundColor: colors.correctDim,
      borderColor: colors.correctBorder,
    },
    dailyIcon: {
      fontSize: 24,
    },
    dailyInfo: {
      flex: 1,
      gap: 3,
    },
    dailyTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    dailyDesc: {
      fontSize: fontSize.sm,
      color: colors.textDim,
      lineHeight: 18,
    },
    dailyScore: {
      fontSize: fontSize.sm,
      color: colors.correct,
      fontWeight: '700',
    },
    dailyArrow: {
      fontSize: 28,
      fontWeight: '300',
      color: colors.accent,
    },
    dailyCheck: {
      fontSize: 20,
      color: colors.correct,
    },
    modeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md + 2,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    modeCardPressed: {
      backgroundColor: colors.surfaceLight,
      transform: [{ scale: 0.98 }],
    },
    modeIconBox: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    modeIcon: {
      fontSize: 24,
    },
    modeInfo: {
      flex: 1,
      gap: 3,
    },
    modeTitle: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    modeDesc: {
      fontSize: fontSize.sm,
      color: colors.textDim,
      lineHeight: 18,
    },
    modeArrow: {
      fontSize: 28,
      fontWeight: '300',
    },

    // Pre-game modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.bg,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
      borderTopWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    modalHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.surfaceBorder,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: spacing.xs,
    },
    modalTitle: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    modalSectionTitle: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textDim,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    difficultyRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    difficultyCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder,
      gap: 2,
    },
    difficultyCardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    difficultyLabel: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.textDim,
    },
    difficultyLabelActive: {
      color: colors.text,
    },
    difficultyDesc: {
      fontSize: fontSize.xs,
      color: colors.textMuted,
    },
    difficultyDescActive: {
      color: colors.textDim,
    },
    opsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    opCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder,
      gap: 2,
    },
    opCardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    opSymbol: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.textDim,
    },
    opSymbolActive: {
      color: colors.accent,
    },
    opLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textDim,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    opLabelActive: {
      color: colors.textSecondary,
    },
    startBtn: {
      backgroundColor: colors.accent,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md + 2,
      alignItems: 'center',
      width: '100%',
    },
    startBtnPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    startBtnText: {
      fontSize: fontSize.md,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    startBtnDisabled: {
      opacity: 0.4,
    },

    // Challenge card
    challengeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md + 2,
      gap: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.correct + '40',
    },
    challengeCardPressed: {
      backgroundColor: colors.surfaceLight,
      transform: [{ scale: 0.98 }],
    },
    challengeIconBox: {
      width: 52,
      height: 52,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: colors.correctDim,
      borderColor: colors.correctBorder,
    },
    challengeIcon: {
      fontSize: 24,
    },

    // Challenge modal
    challengeTabs: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    challengeTab: {
      flex: 1,
      paddingVertical: spacing.sm + 2,
      alignItems: 'center',
      borderRadius: borderRadius.md - 2,
    },
    challengeTabActive: {
      backgroundColor: colors.accent,
    },
    challengeTabText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.textDim,
    },
    challengeTabTextActive: {
      color: '#FFFFFF',
    },
    challengeSection: {
      gap: spacing.md,
      alignItems: 'center',
    },
    challengeCodeDisplay: {
      fontSize: fontSize.xxl,
      fontWeight: '900',
      color: colors.accent,
      letterSpacing: 8,
      textAlign: 'center',
    },
    challengeHint: {
      fontSize: fontSize.sm,
      color: colors.textDim,
      textAlign: 'center',
    },
    challengeShareBtn: {
      backgroundColor: colors.blueDim,
      borderWidth: 1,
      borderColor: colors.blue + '40',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      width: '100%',
    },
    challengeShareText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.blue,
    },
    challengeInput: {
      fontSize: fontSize.xxl,
      fontWeight: '900',
      color: colors.text,
      letterSpacing: 8,
      textAlign: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.surfaceBorder,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      width: '100%',
    },
  });
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [ready, setReady] = useState(false);
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);

  // Pre-game modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('timed');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedOps, setSelectedOps] = useState<Operation[]>(['+', '\u2212', '\u00D7', '\u00F7']);

  // Challenge modal state
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [challengeTab, setChallengeTab] = useState<'create' | 'join'>('create');
  const [challengeCode, setChallengeCode] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const headerAnim = useFadeOnly(100);
  const quickStatsAnim = useFadeIn(200);
  const dailyAnim = useFadeIn(280);
  const modeAnims = [useFadeIn(340), useFadeIn(420), useFadeIn(500), useFadeIn(580)];

  const MODES: {
    key: GameMode;
    title: string;
    desc: string;
    icon: string;
    color: string;
  }[] = useMemo(() => [
    {
      key: 'timed',
      title: 'Timed',
      desc: '60s blitz \u2014 how many can you solve?',
      icon: '\u23F1',
      color: colors.accent,
    },
    {
      key: 'streak',
      title: 'Streak',
      desc: 'One wrong answer and it\'s over',
      icon: '\uD83D\uDD25',
      color: colors.streak,
    },
    {
      key: 'practice',
      title: 'Practice',
      desc: 'No pressure, just sharpen your skills',
      icon: '\uD83E\uDDE0',
      color: colors.blue,
    },
    {
      key: 'gauntlet',
      title: 'The Gauntlet',
      desc: '10s per question, gets harder as you go',
      icon: '\u2694\uFE0F',
      color: colors.wrong,
    },
  ], [colors]);

  // Check if onboarding is needed
  useEffect(() => {
    AsyncStorage.getItem('@numrush_onboarded').then((val) => {
      if (!val) {
        router.replace('/onboarding');
      } else {
        setReady(true);
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      getStats().then(setStats);
      getSettings().then((s) => {
        setSelectedDifficulty(s.difficulty);
        setSelectedOps(s.operations);
      });
      getDailyResult(getTodayDateString()).then(setDailyResult);
      setReady(true);
    }, [])
  );

  const openPreGame = useCallback((mode: GameMode) => {
    if (mode === 'gauntlet') {
      router.push('/play?mode=gauntlet');
      return;
    }
    setSelectedMode(mode);
    setModalVisible(true);
  }, [router]);

  const toggleOp = useCallback((op: Operation) => {
    setSelectedOps((prev) => {
      const has = prev.includes(op);
      if (has && prev.length === 1) return prev; // must keep at least 1
      return has ? prev.filter((o) => o !== op) : [...prev, op];
    });
  }, []);

  const startGame = useCallback(() => {
    setModalVisible(false);
    const opsParam = encodeURIComponent(selectedOps.join(','));
    router.push(`/play?mode=${selectedMode}&difficulty=${selectedDifficulty}&operations=${opsParam}`);
  }, [selectedMode, selectedDifficulty, selectedOps, router]);

  const openChallengeModal = useCallback(() => {
    const code = generateChallengeCode();
    setChallengeCode(code);
    setJoinCode('');
    setChallengeTab('create');
    setChallengeModalVisible(true);
  }, []);

  const shareChallenge = useCallback(async () => {
    try {
      await Share.share({
        message: `I challenge you on NumRush! Enter code: ${challengeCode}\n20 questions, same problems. Can you beat me?`,
      });
    } catch {}
  }, [challengeCode]);

  const startChallenge = useCallback((code: string) => {
    setChallengeModalVisible(false);
    router.push(`/play?mode=challenge&code=${code.toUpperCase()}`);
  }, [router]);

  const startDaily = useCallback(() => {
    router.push('/play?mode=daily');
  }, [router]);

  if (!ready) return <View style={styles.safe} />;

  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round(
          (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100
        )
      : 0;

  const todayStr = getTodayDateString();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header + Nav */}
        <View>
          <View style={styles.topNav}>
            <View style={{ width: 72 }} />
            <View style={styles.topNavRight}>
              <Pressable
                style={({ pressed }) => [
                  styles.topNavBtn,
                  pressed && styles.topNavBtnPressed,
                ]}
                onPress={() => router.push('/stats')}
              >
                <Text style={styles.topNavIcon}>{'\uD83D\uDCCA'}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.topNavBtn,
                  pressed && styles.topNavBtnPressed,
                ]}
                onPress={() => router.push('/settings')}
              >
                <Text style={styles.topNavIcon}>{'\u2699\uFE0F'}</Text>
              </Pressable>
            </View>
          </View>
          <Animated.View style={[styles.header, headerAnim]}>
            <Text style={styles.title}>NumRush</Text>
            <View style={styles.titleAccent} />
            <Text style={styles.subtitle}>Mental Math Trainer</Text>
          </Animated.View>
        </View>

        {/* Quick Stats */}
        <Animated.View style={[styles.quickStats, quickStatsAnim]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalCorrect}</Text>
            <Text style={styles.statLabel}>Solved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.streak }]}>
              {stats.bestStreak}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.correct }]}>
              {accuracy}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </Animated.View>

        {/* Mode Cards */}
        <View style={styles.modes}>
          {/* Daily Challenge */}
          <Animated.View style={dailyAnim}>
            <Pressable
              style={({ pressed }) => [
                styles.dailyCard,
                pressed && styles.dailyCardPressed,
                dailyResult?.completed && styles.dailyCardCompleted,
              ]}
              onPress={startDaily}
            >
              <View
                style={[
                  styles.dailyIconBox,
                  dailyResult?.completed && styles.dailyIconBoxCompleted,
                ]}
              >
                <Text style={styles.dailyIcon}>{'\uD83C\uDFC6'}</Text>
              </View>
              <View style={styles.dailyInfo}>
                <Text style={styles.dailyTitle}>Daily Challenge</Text>
                {dailyResult?.completed ? (
                  <Text style={styles.dailyScore}>
                    {dailyResult.score}/20 {'\u00B7'} {dailyResult.accuracy}%
                  </Text>
                ) : (
                  <Text style={styles.dailyDesc}>
                    {formatTodayReadable()} {'\u00B7'} 20 questions
                  </Text>
                )}
              </View>
              {dailyResult?.completed ? (
                <Text style={styles.dailyCheck}>{'\u2713'}</Text>
              ) : (
                <Text style={styles.dailyArrow}>{'\u203A'}</Text>
              )}
            </Pressable>
          </Animated.View>

          {MODES.map((mode, i) => (
            <Animated.View
              key={mode.key}
              style={modeAnims[i]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.modeCard,
                  pressed && styles.modeCardPressed,
                ]}
                onPress={() => openPreGame(mode.key)}
              >
                <View
                  style={[
                    styles.modeIconBox,
                    { backgroundColor: mode.color + '18', borderColor: mode.color + '40' },
                  ]}
                >
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                </View>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                </View>
                <Text style={[styles.modeArrow, { color: mode.color }]}>{'\u203A'}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Challenge a Friend */}
        <Pressable
          style={({ pressed }) => [
            styles.challengeCard,
            pressed && styles.challengeCardPressed,
          ]}
          onPress={openChallengeModal}
        >
          <View style={styles.challengeIconBox}>
            <Text style={styles.challengeIcon}>{'\uD83C\uDFC1'}</Text>
          </View>
          <View style={styles.modeInfo}>
            <Text style={styles.modeTitle}>Challenge a Friend</Text>
            <Text style={styles.modeDesc}>Same 20 questions, compare scores</Text>
          </View>
          <Text style={[styles.modeArrow, { color: colors.correct }]}>{'\u203A'}</Text>
        </Pressable>

        </ScrollView>
      </View>

      {/* Pre-game Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {selectedMode === 'timed'
                ? '\u23F1 Timed'
                : selectedMode === 'streak'
                ? '\uD83D\uDD25 Streak'
                : '\uD83E\uDDE0 Practice'}
            </Text>

            {/* Difficulty */}
            <View>
              <Text style={styles.modalSectionTitle}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {DIFFICULTIES.map((d) => {
                  const active = selectedDifficulty === d;
                  return (
                    <Pressable
                      key={d}
                      style={[
                        styles.difficultyCard,
                        active && styles.difficultyCardActive,
                      ]}
                      onPress={() => setSelectedDifficulty(d)}
                    >
                      <Text
                        style={[
                          styles.difficultyLabel,
                          active && styles.difficultyLabelActive,
                        ]}
                      >
                        {DIFFICULTY_LABELS[d]}
                      </Text>
                      <Text
                        style={[
                          styles.difficultyDesc,
                          active && styles.difficultyDescActive,
                        ]}
                      >
                        {DIFFICULTY_DESC[d]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Operations */}
            <View>
              <Text style={styles.modalSectionTitle}>Operations</Text>
              <View style={styles.opsRow}>
                {OPERATIONS.map((op) => {
                  const active = selectedOps.includes(op.key);
                  return (
                    <Pressable
                      key={op.key}
                      style={[styles.opCard, active && styles.opCardActive]}
                      onPress={() => toggleOp(op.key)}
                    >
                      <Text style={[styles.opSymbol, active && styles.opSymbolActive]}>
                        {op.symbol}
                      </Text>
                      <Text style={[styles.opLabel, active && styles.opLabelActive]}>
                        {op.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Start */}
            <Pressable
              style={({ pressed }) => [
                styles.startBtn,
                pressed && styles.startBtnPressed,
              ]}
              onPress={startGame}
            >
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Challenge Modal */}
      <Modal
        visible={challengeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChallengeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setChallengeModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{'\uD83C\uDFC1'} Challenge</Text>

            {/* Tabs */}
            <View style={styles.challengeTabs}>
              <Pressable
                style={[styles.challengeTab, challengeTab === 'create' && styles.challengeTabActive]}
                onPress={() => setChallengeTab('create')}
              >
                <Text style={[styles.challengeTabText, challengeTab === 'create' && styles.challengeTabTextActive]}>
                  Create
                </Text>
              </Pressable>
              <Pressable
                style={[styles.challengeTab, challengeTab === 'join' && styles.challengeTabActive]}
                onPress={() => setChallengeTab('join')}
              >
                <Text style={[styles.challengeTabText, challengeTab === 'join' && styles.challengeTabTextActive]}>
                  Join
                </Text>
              </Pressable>
            </View>

            {challengeTab === 'create' ? (
              <View style={styles.challengeSection}>
                <Text style={styles.modalSectionTitle}>Your Code</Text>
                <Text style={styles.challengeCodeDisplay}>{challengeCode}</Text>
                <Text style={styles.challengeHint}>Share this code with a friend</Text>
                <Pressable
                  style={({ pressed }) => [styles.challengeShareBtn, pressed && { opacity: 0.7 }]}
                  onPress={shareChallenge}
                >
                  <Text style={styles.challengeShareText}>{'\uD83D\uDCE4'} Share Code</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
                  onPress={() => startChallenge(challengeCode)}
                >
                  <Text style={styles.startBtnText}>Play</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.challengeSection}>
                <Text style={styles.modalSectionTitle}>Enter Code</Text>
                <TextInput
                  style={styles.challengeInput}
                  value={joinCode}
                  onChangeText={(t) => setJoinCode(t.toUpperCase().slice(0, 4))}
                  placeholder="ABCD"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={4}
                  autoCorrect={false}
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.startBtn,
                    joinCode.length < 4 && styles.startBtnDisabled,
                    pressed && styles.startBtnPressed,
                  ]}
                  onPress={() => {
                    if (joinCode.length === 4) startChallenge(joinCode);
                  }}
                >
                  <Text style={styles.startBtnText}>Play</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
