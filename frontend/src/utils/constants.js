export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const DIFFICULTY_CONFIG = {
  [DIFFICULTY_LEVELS.EASY]: {
    label: 'Easy',
    emoji: '🌱',
    color: 'green',
    description: 'Simple concepts & explanations'
  },
  [DIFFICULTY_LEVELS.MEDIUM]: {
    label: 'Medium',
    emoji: '🎯',
    color: 'blue',
    description: 'Balanced learning approach'
  },
  [DIFFICULTY_LEVELS.HARD]: {
    label: 'Hard',
    emoji: '🚀',
    color: 'purple',
    description: 'Advanced & detailed content'
  }
};

export const ACHIEVEMENT_THRESHOLDS = {
  QUIZ_MASTER: 50,
  WEEK_WARRIOR: 7,
  SHARP_SHOOTER: 90,
  FAST_LEARNER: 'hard'
};

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4'
};