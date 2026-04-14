import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeColors, fontSize, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/theme/ThemeContext';
import { getStats, resetStats } from '../src/storage/store';
import { Stats, DEFAULT_STATS } from '../src/types';
import { StatsCard } from '../src/components/StatsCard';

const MODE_ICONS: Record<string, string> = {
  timed: '\u23F1',
  streak: '\uD83D\uDD25',
  practice: '\uD83E\uDDE0',
  daily: '\uD83C\uDFC6',
  gauntlet: '\u2694\uFE0F',
  challenge: '\uD83C\uDFC1',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function useFadeIn(delay: number, duration: number = 300) {
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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
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
    title: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.text,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.sm,
      paddingBottom: spacing.xxxl,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },

    // History
    historySection: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: fontSize.xs,
      fontWeight: '700',
      color: colors.textDim,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    historyLeft: {
      gap: 4,
    },
    historyModeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    historyIcon: {
      fontSize: 14,
    },
    historyMode: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    historyMeta: {
      fontSize: fontSize.xs,
      color: colors.textDim,
    },
    historyRight: {
      alignItems: 'flex-end',
      gap: 4,
    },
    historyScore: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.accent,
      fontVariant: ['tabular-nums'],
    },
    historyAccuracy: {
      fontSize: fontSize.xs,
      color: colors.textDim,
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
    },
    historySpeed: {
      fontSize: fontSize.xs,
      color: colors.blue,
      fontVariant: ['tabular-nums'],
      fontWeight: '600',
    },

    // Empty
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    emptyHint: {
      fontSize: fontSize.sm,
      color: colors.textDim,
    },

    // Reset
    resetBtn: {
      marginTop: spacing.xl,
      backgroundColor: colors.wrongDim,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.wrongBorder,
    },
    resetBtnPressed: {
      opacity: 0.7,
    },
    resetText: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.wrong,
    },
  });
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  const anim1 = useFadeIn(100);
  const anim2 = useFadeIn(150);
  const anim3 = useFadeIn(200);
  const anim4 = useFadeIn(300);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round(
          (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100
        )
      : 0;

  const handleReset = () => {
    Alert.alert(
      'Reset Stats',
      'This will permanently erase all your stats and history. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetStats();
            setStats(DEFAULT_STATS);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.title}>Stats</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Cards */}
        <Animated.View style={anim1}>
          <View style={styles.row}>
            <StatsCard label="Total Solved" value={stats.totalCorrect + stats.totalWrong} large />
            <StatsCard label="Games Played" value={stats.gamesPlayed} large />
          </View>
        </Animated.View>

        <Animated.View style={anim2}>
          <View style={styles.row}>
            <StatsCard label="Correct" value={stats.totalCorrect} color={colors.correct} />
            <StatsCard label="Wrong" value={stats.totalWrong} color={colors.wrong} />
            <StatsCard label="Accuracy" value={`${accuracy}%`} color={accuracy >= 80 ? colors.correct : colors.textSecondary} />
          </View>
        </Animated.View>

        <Animated.View style={anim3}>
          <View style={styles.row}>
            <StatsCard label="Best Streak" value={stats.bestStreak} color={colors.streak} />
            <StatsCard label="Best Timed" value={stats.bestTimedScore} color={colors.accent} />
          </View>
        </Animated.View>

        {/* Recent Games */}
        {stats.history.length > 0 && (
          <Animated.View
            style={[styles.historySection, anim4]}
          >
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {stats.history.slice(0, 20).map((game, i) => (
              <View key={i} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyModeRow}>
                    <Text style={styles.historyIcon}>
                      {MODE_ICONS[game.mode] || ''}
                    </Text>
                    <Text style={styles.historyMode}>
                      {game.mode.charAt(0).toUpperCase() + game.mode.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.historyMeta}>
                    {game.difficulty} {'\u00B7'} {formatDate(game.date)}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyScore}>{game.score}</Text>
                  <Text
                    style={[
                      styles.historyAccuracy,
                      game.accuracy >= 80 && { color: colors.correct },
                    ]}
                  >
                    {game.accuracy}%
                  </Text>
                  {game.avgSpeed > 0 && (
                    <Text style={styles.historySpeed}>
                      {game.avgSpeed}s/prob
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Empty state */}
        {stats.history.length === 0 && (
          <Animated.View
            style={[styles.emptyState, anim4]}
          >
            <Text style={styles.emptyIcon}>{'\uD83C\uDFAF'}</Text>
            <Text style={styles.emptyText}>No games played yet</Text>
            <Text style={styles.emptyHint}>
              Play your first game to start tracking stats
            </Text>
          </Animated.View>
        )}

        {/* Reset */}
        {stats.gamesPlayed > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.resetBtn,
              pressed && styles.resetBtnPressed,
            ]}
            onPress={handleReset}
          >
            <Text style={styles.resetText}>Reset All Stats</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
