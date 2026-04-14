import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Switch,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemeColors, fontSize, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/theme/ThemeContext';
import { getSettings, saveSettings } from '../src/storage/store';
import { Settings, DEFAULT_SETTINGS } from '../src/types';

const DURATIONS = [30, 60, 90, 120];

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
      gap: spacing.xl,
      paddingBottom: spacing.xxxl,
    },

    // Sections
    section: {
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

    // Duration
    durationRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    durationBtn: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder,
      gap: 2,
    },
    durationBtnActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    durationValue: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.textDim,
      fontVariant: ['tabular-nums'],
    },
    durationValueActive: {
      color: colors.text,
    },
    durationUnit: {
      fontSize: fontSize.xs,
      fontWeight: '600',
      color: colors.textMuted,
    },
    durationUnitActive: {
      color: colors.textDim,
    },

    // Theme toggle
    themeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    themeBtn: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.surfaceBorder,
      gap: spacing.xs,
    },
    themeBtnActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentDim,
    },
    themeIcon: {
      fontSize: 24,
    },
    themeLabel: {
      fontSize: fontSize.sm,
      fontWeight: '700',
      color: colors.textDim,
    },
    themeLabelActive: {
      color: colors.text,
    },

    // Switches
    switchCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      overflow: 'hidden',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    switchDivider: {
      height: 1,
      backgroundColor: colors.surfaceBorder,
      marginHorizontal: spacing.md,
    },
    switchInfo: {
      flex: 1,
      gap: 2,
    },
    switchLabel: {
      fontSize: fontSize.md,
      color: colors.text,
      fontWeight: '600',
    },
    switchDesc: {
      fontSize: fontSize.xs,
      color: colors.textDim,
    },
  });
}

export default function SettingsScreen() {
  const { colors, theme, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const durationAnim = useFadeIn(100);
  const themeAnim = useFadeIn(200);
  const feedbackAnim = useFadeIn(300);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Timer Duration */}
        <Animated.View style={[styles.section, durationAnim]}>
          <Text style={styles.sectionTitle}>Timed Mode Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => {
              const active = settings.timedDuration === d;
              return (
                <Pressable
                  key={d}
                  style={[styles.durationBtn, active && styles.durationBtnActive]}
                  onPress={() => update({ timedDuration: d })}
                >
                  <Text
                    style={[
                      styles.durationValue,
                      active && styles.durationValueActive,
                    ]}
                  >
                    {d}
                  </Text>
                  <Text
                    style={[
                      styles.durationUnit,
                      active && styles.durationUnitActive,
                    ]}
                  >
                    sec
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Theme */}
        <Animated.View style={[styles.section, themeAnim]}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.themeRow}>
            <Pressable
              style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]}
              onPress={() => {
                if (theme !== 'dark') {
                  toggleTheme();
                  update({ theme: 'dark' });
                }
              }}
            >
              <Text style={styles.themeIcon}>{'\uD83C\uDF19'}</Text>
              <Text style={[styles.themeLabel, theme === 'dark' && styles.themeLabelActive]}>
                Dark
              </Text>
            </Pressable>
            <Pressable
              style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]}
              onPress={() => {
                if (theme !== 'light') {
                  toggleTheme();
                  update({ theme: 'light' });
                }
              }}
            >
              <Text style={styles.themeIcon}>{'\u2600\uFE0F'}</Text>
              <Text style={[styles.themeLabel, theme === 'light' && styles.themeLabelActive]}>
                Light
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Feedback */}
        <Animated.View style={[styles.section, feedbackAnim]}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <View style={styles.switchCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Sound Effects</Text>
                <Text style={styles.switchDesc}>Play sounds on correct/wrong</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={(v) => update({ soundEnabled: v })}
                trackColor={{
                  false: colors.surfaceLight,
                  true: colors.accentDim,
                }}
                thumbColor={settings.soundEnabled ? colors.accent : colors.textDim}
              />
            </View>
            <View style={styles.switchDivider} />
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Haptic Feedback</Text>
                <Text style={styles.switchDesc}>Vibrate on answers</Text>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={(v) => update({ hapticEnabled: v })}
                trackColor={{
                  false: colors.surfaceLight,
                  true: colors.accentDim,
                }}
                thumbColor={settings.hapticEnabled ? colors.accent : colors.textDim}
              />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
