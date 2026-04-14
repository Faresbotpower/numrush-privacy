import React, { useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { ThemeColors } from '../theme';
import { fontSize, spacing, borderRadius } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  seconds: number;
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'baseline',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      gap: 2,
    },
    containerLow: {
      backgroundColor: colors.wrongDim,
      borderColor: colors.wrongBorder,
    },
    containerCritical: {
      backgroundColor: colors.wrongDim,
      borderColor: colors.wrong,
    },
    time: {
      fontSize: fontSize.lg,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    timeLow: {
      color: colors.wrong,
    },
    timeCritical: {
      color: colors.wrong,
    },
    unit: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.textDim,
    },
    unitLow: {
      color: colors.wrong,
    },
  });
}

export function Timer({ seconds }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLow) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [seconds, isLow]);

  return (
    <Animated.View
      style={[
        styles.container,
        isLow && styles.containerLow,
        isCritical && styles.containerCritical,
        { transform: [{ scale }] },
      ]}
    >
      <Text
        style={[
          styles.time,
          isLow && styles.timeLow,
          isCritical && styles.timeCritical,
        ]}
      >
        {seconds}
      </Text>
      <Text style={[styles.unit, isLow && styles.unitLow]}>s</Text>
    </Animated.View>
  );
}
