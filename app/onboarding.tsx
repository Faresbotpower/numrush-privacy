import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, fontSize, spacing, borderRadius } from '../src/theme';
import { useTheme } from '../src/theme/ThemeContext';

const { width } = Dimensions.get('window');

const PAGES = [
  {
    icon: '\uD83E\uDDE0',
    title: 'Train Your Brain',
    desc: 'Sharpen your mental math with quick-fire arithmetic problems across all four operations.',
  },
  {
    icon: '\uD83C\uDFAE',
    title: 'Four Game Modes',
    items: [
      { icon: '\u23F1', label: 'Timed', desc: 'Solve as many as you can in 60 seconds' },
      { icon: '\uD83D\uDD25', label: 'Streak', desc: 'One wrong answer and it\'s over' },
      { icon: '\uD83E\uDDE0', label: 'Practice', desc: 'No pressure, just practice' },
      { icon: '\uD83C\uDFC6', label: 'Daily', desc: '20 problems, new challenge every day' },
    ],
  },
  {
    icon: '\uD83D\uDE80',
    title: 'Ready?',
    desc: 'Choose your difficulty, pick your operations, and start solving. Beat your high score!',
  },
];

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    topRow: {
      alignItems: 'flex-end',
      paddingTop: spacing.sm,
    },
    skipText: {
      fontSize: fontSize.md,
      color: colors.textDim,
      fontWeight: '600',
    },
    content: {
      alignItems: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    icon: {
      fontSize: 64,
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
      letterSpacing: -1,
    },
    desc: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      maxWidth: 320,
    },
    itemsList: {
      width: '100%',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    itemIconBox: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.bgElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemIcon: {
      fontSize: 20,
    },
    itemInfo: {
      flex: 1,
      gap: 2,
    },
    itemLabel: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    itemDesc: {
      fontSize: fontSize.sm,
      color: colors.textDim,
    },
    bottom: {
      gap: spacing.lg,
      alignItems: 'center',
    },
    dots: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceLight,
    },
    dotActive: {
      backgroundColor: colors.accent,
      width: 24,
    },
    nextBtn: {
      width: '100%',
      paddingVertical: spacing.md + 2,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    startBtn: {
      backgroundColor: colors.accent,
      borderColor: colors.accentLight,
    },
    btnPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.98 }],
    },
    nextText: {
      fontSize: fontSize.md,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    startText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
  });
}

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const [page, setPage] = useState(0);
  const current = PAGES[page];
  const isLast = page === PAGES.length - 1;

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTranslateY = useRef(new Animated.Value(18)).current;
  const itemAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bottomTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (current.items) {
      itemAnims.forEach((anim, i) => {
        anim.setValue(0);
        setTimeout(() => {
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 200 + i * 100);
      });
    }
  }, [page]);

  const finish = async () => {
    await AsyncStorage.setItem('@numrush_onboarded', 'true');
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Skip */}
        <View style={styles.topRow}>
          {!isLast ? (
            <Pressable onPress={finish}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View />
          )}
        </View>

        {/* Content */}
        <Animated.View
          style={[styles.content, { opacity: contentOpacity }]}
        >
          <Text style={styles.icon}>{current.icon}</Text>
          <Text style={styles.title}>{current.title}</Text>

          {current.desc && (
            <Text style={styles.desc}>{current.desc}</Text>
          )}

          {current.items && (
            <View style={styles.itemsList}>
              {current.items.map((item, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.itemCard,
                    {
                      opacity: itemAnims[i],
                      transform: [{
                        translateY: itemAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [18, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  <View style={styles.itemIconBox}>
                    <Text style={styles.itemIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Bottom */}
        <Animated.View style={[styles.bottom, { opacity: bottomOpacity, transform: [{ translateY: bottomTranslateY }] }]}>
          {/* Dots */}
          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === page && styles.dotActive]}
              />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              isLast && styles.startBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => {
              if (isLast) finish();
              else setPage(page + 1);
            }}
          >
            <Text style={[styles.nextText, isLast && styles.startText]}>
              {isLast ? "Let's Go" : 'Next'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
