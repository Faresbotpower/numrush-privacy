import React, { useRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { ThemeColors } from '../theme';
import { fontSize, spacing, borderRadius } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  onPress: (value: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['DEL', '0', 'GO'],
];

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    keyWrapper: {
      flex: 1,
      maxWidth: 120,
    },
    key: {
      height: 62,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    goKey: {
      backgroundColor: colors.accent,
      borderColor: colors.accentLight,
    },
    delKey: {
      backgroundColor: colors.bgElevated,
      borderColor: colors.surfaceBorder,
    },
    keyDisabled: {
      opacity: 0.3,
    },
    keyText: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    actionText: {
      fontSize: fontSize.md,
      fontWeight: '700',
    },
    goText: {
      color: '#FFFFFF',
      fontSize: fontSize.md,
      fontWeight: '800',
      letterSpacing: 1,
    },
    delText: {
      fontSize: fontSize.lg + 4,
      color: colors.textSecondary,
    },
  });
}

function PadKey({
  label,
  onPress,
  variant = 'default',
  disabled,
  colors,
}: {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'go' | 'del';
  disabled?: boolean;
  colors: ThemeColors;
}) {
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.keyWrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={[
          styles.key,
          variant === 'go' && styles.goKey,
          variant === 'del' && styles.delKey,
          disabled && styles.keyDisabled,
        ]}
        onPressIn={() => {
          Animated.spring(scale, {
            toValue: 0.92,
            damping: 15,
            stiffness: 400,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, {
            toValue: 1,
            damping: 12,
            stiffness: 300,
            useNativeDriver: true,
          }).start();
        }}
        onPress={() => {
          if (!disabled) onPress();
        }}
      >
        <Text
          style={[
            styles.keyText,
            variant !== 'default' && styles.actionText,
            variant === 'go' && styles.goText,
            variant === 'del' && styles.delText,
          ]}
        >
          {label === 'DEL' ? '\u232B' : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function NumberPad({ onPress, onDelete, onSubmit, disabled }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) => {
            const variant =
              key === 'GO' ? 'go' : key === 'DEL' ? 'del' : 'default';
            return (
              <PadKey
                key={key}
                label={key}
                variant={variant}
                disabled={disabled}
                colors={colors}
                onPress={() => {
                  if (key === 'DEL') onDelete();
                  else if (key === 'GO') onSubmit();
                  else onPress(key);
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
