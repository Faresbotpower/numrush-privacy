import React, { useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import { ThemeColors } from '../theme';
import { fontSize, spacing, borderRadius } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  value: string;
  feedback?: 'none' | 'correct' | 'wrong';
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md + 4,
      paddingHorizontal: spacing.xl,
      minWidth: 200,
      borderWidth: 2,
    },
    text: {
      fontSize: fontSize.hero,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
      letterSpacing: -1,
      minHeight: 70,
      lineHeight: 76,
    },
    placeholder: {
      color: colors.textMuted,
    },
    cursor: {
      width: 3,
      height: 44,
      backgroundColor: colors.accent,
      marginLeft: spacing.xs,
      borderRadius: 2,
    },
  });
}

export function AnswerInput({ value, feedback = 'none' }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  useEffect(() => {
    if (feedback === 'correct') {
      Animated.sequence([
        Animated.timing(borderColorAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (feedback === 'wrong') {
      Animated.sequence([
        Animated.timing(borderColorAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [feedback]);

  const interpolatedBorderColor = borderColorAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [colors.wrong, colors.surfaceBorder, colors.correct],
  });

  const cursorStyle = {
    opacity: value.length > 0 ? cursorOpacity : 1,
  };

  return (
    <Animated.View style={[styles.container, { borderColor: interpolatedBorderColor }]}>
      <Text style={[styles.text, !value && styles.placeholder]}>
        {value || ''}
      </Text>
      <Animated.View style={[styles.cursor, cursorStyle]} />
    </Animated.View>
  );
}
