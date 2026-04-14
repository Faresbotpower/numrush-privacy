import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '../theme';
import { fontSize, spacing, borderRadius } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  label: string;
  value: string | number;
  color?: string;
  large?: boolean;
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      minHeight: 80,
    },
    containerLarge: {
      minHeight: 110,
      padding: spacing.lg,
    },
    label: {
      fontSize: fontSize.xs,
      color: colors.textDim,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      fontSize: fontSize.xl,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    valueLarge: {
      fontSize: fontSize.xxl,
    },
  });
}

export function StatsCard({ label, value, color, large }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (!label && !value) {
    return <View style={styles.container} />;
  }

  return (
    <View style={[styles.container, large && styles.containerLarge]}>
      <Text style={[styles.value, large && styles.valueLarge, color ? { color } : null]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
