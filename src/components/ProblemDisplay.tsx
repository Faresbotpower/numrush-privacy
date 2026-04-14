import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { ThemeColors } from '../theme';
import { fontSize, spacing } from '../theme';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  problem: string;
  feedback: 'none' | 'correct' | 'wrong';
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
    },
    inner: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    text: {
      fontSize: fontSize.problem,
      fontWeight: '800',
      color: colors.text,
      fontVariant: ['tabular-nums'],
      letterSpacing: -2,
    },
    equals: {
      fontSize: fontSize.xl,
      fontWeight: '600',
      color: colors.textDim,
      fontVariant: ['tabular-nums'],
    },
  });
}

export function ProblemDisplay({ problem, feedback }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // New problem entrance
    opacity.setValue(0);
    scale.setValue(0.85);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [problem]);

  useEffect(() => {
    if (feedback === 'correct') {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (feedback === 'wrong') {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -12,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 12,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [feedback]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.inner,
          {
            transform: [{ scale }, { translateX }],
            opacity,
          },
        ]}
      >
        <Text
          style={styles.text}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {problem}
        </Text>
        <Text style={styles.equals}>= ?</Text>
      </Animated.View>
    </View>
  );
}
