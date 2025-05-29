export interface VisualizationState {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  highlightedLines: number[];
}

export interface StackElement {
  id: number;
  value: number;
  color: string;
}

export interface StackOperation {
  type: 'push' | 'pop' | 'peek';
  value?: number;
  timestamp: number;
  result?: any;
}

export interface CodeExample {
  language: string;
  code: string;
  highlightLines?: number[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'data-structure' | 'algorithm';
  estimatedTime: number; // in minutes
  prerequisites: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  topics: string[];
  totalTime: number;
}

export const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
} as const;

export const ANIMATION_SPEEDS = {
  slow: 1000,
  normal: 500,
  fast: 200,
  instant: 0,
} as const;
