import { Operation, Problem, Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from './difficulty';

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simple seeded random number generator (mulberry32)
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
}

function seededRand(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function generateProblemWithRng(
  difficulty: Difficulty,
  operations: Operation[],
  randFn: (min: number, max: number) => number
): Problem {
  const config = DIFFICULTY_CONFIG[difficulty];
  const operation = operations[randFn(0, operations.length - 1)];

  let a: number;
  let b: number;
  let answer: number;

  switch (operation) {
    case '+':
      a = randFn(config.min, config.max);
      b = randFn(config.min, config.max);
      answer = a + b;
      break;
    case '−':
      // Ensure positive result
      a = randFn(config.min, config.max);
      b = randFn(config.min, a);
      answer = a - b;
      break;
    case '×':
      if (difficulty === 'hard') {
        // For hard mode, keep one factor smaller
        a = randFn(10, 99);
        b = randFn(2, 12);
      } else {
        a = randFn(config.min, config.max);
        b = randFn(config.min, config.max);
      }
      answer = a * b;
      break;
    case '÷':
      // Generate clean division: pick answer and divisor, compute dividend
      answer = randFn(1, config.divMax);
      b = randFn(2, config.divMax);
      a = answer * b;
      break;
    default:
      a = randFn(config.min, config.max);
      b = randFn(config.min, config.max);
      answer = a + b;
  }

  return {
    a,
    b,
    operation,
    answer,
    displayStr: `${a} ${operation} ${b}`,
  };
}

export function generateProblem(
  difficulty: Difficulty,
  operations: Operation[]
): Problem {
  return generateProblemWithRng(difficulty, operations, rand);
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I or O to avoid confusion

export function generateChallengeCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function generateChallengeProblems(code: string): Problem[] {
  const seed = hashString(`numrush-challenge-${code.toUpperCase()}`);
  const rng = seededRandom(seed);
  const randFn = (min: number, max: number) => seededRand(rng, min, max);

  const allOps: Operation[] = ['+', '\u2212', '\u00D7', '\u00F7'];
  const difficulty: Difficulty = 'medium';
  const problems: Problem[] = [];

  for (let i = 0; i < 20; i++) {
    problems.push(generateProblemWithRng(difficulty, allOps, randFn));
  }

  return problems;
}

export function generateDailyProblems(date: string): Problem[] {
  const seed = hashString(`numrush-daily-${date}`);
  const rng = seededRandom(seed);
  const randFn = (min: number, max: number) => seededRand(rng, min, max);

  const allOps: Operation[] = ['+', '−', '×', '÷'];
  const difficulty: Difficulty = 'medium';
  const problems: Problem[] = [];

  for (let i = 0; i < 20; i++) {
    problems.push(generateProblemWithRng(difficulty, allOps, randFn));
  }

  return problems;
}
