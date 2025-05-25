// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
}

// Question types
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface BaseQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  questionType: 'multiple-choice';
  options: string[];
  correctAnswer: number; // Index of the correct option
}

export interface TrueFalseQuestion extends BaseQuestion {
  questionType: 'true-false';
  correctAnswer: boolean;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  questionType: 'short-answer';
  correctAnswer: string;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ShortAnswerQuestion;

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  timeLimit: number; // In minutes
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quiz attempt types
export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startTime: string;
  endTime: string | null;
  answers: Answer[];
  score: number | null;
  completed: boolean;
}

export interface Answer {
  questionId: string;
  answer: string | number | boolean;
  isCorrect?: boolean;
  points?: number;
}