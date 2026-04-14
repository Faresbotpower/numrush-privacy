import React, { useRef, useEffect, useMemo } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { ThemeColors } from '../theme';
import { fontSize, spacing, borderRadius } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  streak: number;
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.streakDim,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.streakBorder,
    },
    containerBig: {
      borderColor: colors.streak,
    },
    containerHuge: {
      backgroundColor: colors.streak + '25',
      borderColor: colors.streak,
    },
    fire: {
      fontSize: fontSize.md,
    },
    count: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.streak,
      fontVariant: ['tabular-nums'],
    },
    countHuge: {
      color: colors.streak,
    },
  });
}

export function StreakBadge({ streak }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(streak > 0 ? 1 : 0)).current;
  const isBig = streak >= 5;
  const isHuge = streak >= 10;

  useEffect(() => {
    if (streak > 0) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 8,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [streak]);

  if (streak === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        isBig && styles.containerBig,
        isHuge && styles.containerHuge,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Text style={styles.fire}>{'\u{1F525}'}</Text>
      <Text style={[styles.count, isHuge && styles.countHuge]}>{streak}</Text>
    </Animated.View>
  );
}
