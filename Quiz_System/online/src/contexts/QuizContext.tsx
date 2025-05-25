import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Question } from '../types';
import { useAuth } from './AuthContext';

interface QuizContextType {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  getQuiz: (id: string) => Quiz | undefined;
  getQuizAttempt: (id: string) => QuizAttempt | undefined;
  getQuizAttemptsByQuiz: (quizId: string) => QuizAttempt[];
  getQuizAttemptsByStudent: (studentId: string) => QuizAttempt[];
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Quiz;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => Quiz | undefined;
  deleteQuiz: (id: string) => boolean;
  startQuizAttempt: (quizId: string) => QuizAttempt;
  submitQuizAttempt: (id: string, answers: QuizAttempt['answers']) => QuizAttempt | undefined;
}

const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

// Initial sample quiz data
const initialQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Test your knowledge about React fundamentals.',
    teacherId: '1',
    timeLimit: 10,
    isPublished: true,
    questions: [
      {
        id: '1-1',
        questionText: 'What is React?',
        questionType: 'multiple-choice',
        options: [
          'A JavaScript library for building user interfaces',
          'A programming language',
          'A database management system',
          'A server-side framework'
        ],
        correctAnswer: 0,
        points: 5
      },
      {
        id: '1-2',
        questionText: 'React was created by Facebook.',
        questionType: 'true-false',
        correctAnswer: true,
        points: 3
      },
      {
        id: '1-3',
        questionText: 'What hook is used for side effects in React?',
        questionType: 'short-answer',
        correctAnswer: 'useEffect',
        points: 7
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const initialAttempts: QuizAttempt[] = [];

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedQuizzes = localStorage.getItem('quizzes');
    const savedAttempts = localStorage.getItem('quiz_attempts');
    
    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes));
    } else {
      setQuizzes(initialQuizzes);
      localStorage.setItem('quizzes', JSON.stringify(initialQuizzes));
    }
    
    if (savedAttempts) {
      setAttempts(JSON.parse(savedAttempts));
    } else {
      localStorage.setItem('quiz_attempts', JSON.stringify(initialAttempts));
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }, [quizzes]);
  
  useEffect(() => {
    localStorage.setItem('quiz_attempts', JSON.stringify(attempts));
  }, [attempts]);
  
  // Quiz operations
  const getQuiz = (id: string) => {
    return quizzes.find(quiz => quiz.id === id);
  };
  
  const createQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newQuiz: Quiz = {
      ...quizData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  };
  
  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    const quizIndex = quizzes.findIndex(quiz => quiz.id === id);
    
    if (quizIndex === -1) return undefined;
    
    const updatedQuiz = {
      ...quizzes[quizIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const newQuizzes = [...quizzes];
    newQuizzes[quizIndex] = updatedQuiz;
    
    setQuizzes(newQuizzes);
    return updatedQuiz;
  };
  
  const deleteQuiz = (id: string) => {
    const quizIndex = quizzes.findIndex(quiz => quiz.id === id);
    
    if (quizIndex === -1) return false;
    
    const newQuizzes = [...quizzes];
    newQuizzes.splice(quizIndex, 1);
    
    setQuizzes(newQuizzes);
    
    // Also remove any attempts for this quiz
    setAttempts(prev => prev.filter(attempt => attempt.quizId !== id));
    
    return true;
  };
  
  // Quiz attempt operations
  const getQuizAttempt = (id: string) => {
    return attempts.find(attempt => attempt.id === id);
  };
  
  const getQuizAttemptsByQuiz = (quizId: string) => {
    return attempts.filter(attempt => attempt.quizId === quizId);
  };
  
  const getQuizAttemptsByStudent = (studentId: string) => {
    return attempts.filter(attempt => attempt.studentId === studentId);
  };
  
  const startQuizAttempt = (quizId: string) => {
    if (!user) throw new Error('User must be logged in to start a quiz');
    
    const quiz = getQuiz(quizId);
    if (!quiz) throw new Error('Quiz not found');
    
    const newAttempt: QuizAttempt = {
      id: Date.now().toString(),
      quizId,
      studentId: user.id,
      startTime: new Date().toISOString(),
      endTime: null,
      answers: [],
      score: null,
      completed: false,
    };
    
    setAttempts(prev => [...prev, newAttempt]);
    return newAttempt;
  };
  
  const submitQuizAttempt = (id: string, answers: QuizAttempt['answers']) => {
    const attemptIndex = attempts.findIndex(attempt => attempt.id === id);
    
    if (attemptIndex === -1) return undefined;
    
    const attempt = attempts[attemptIndex];
    const quiz = getQuiz(attempt.quizId);
    
    if (!quiz) return undefined;
    
    // Calculate score
    let totalScore = 0;
    let totalPoints = 0;
    
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        return { ...answer, isCorrect: false, points: 0 };
      }
      
      totalPoints += question.points;
      let isCorrect = false;
      
      switch (question.questionType) {
        case 'multiple-choice':
          isCorrect = answer.answer === question.correctAnswer;
          break;
        case 'true-false':
          isCorrect = answer.answer === question.correctAnswer;
          break;
        case 'short-answer':
          // Case-insensitive comparison for short answers
          isCorrect = String(answer.answer).toLowerCase() === question.correctAnswer.toLowerCase();
          break;
      }
      
      const earnedPoints = isCorrect ? question.points : 0;
      totalScore += earnedPoints;
      
      return { ...answer, isCorrect, points: earnedPoints };
    });
    
    const finalScore = Math.round((totalScore / totalPoints) * 100);
    
    const updatedAttempt: QuizAttempt = {
      ...attempt,
      answers: gradedAnswers,
      score: finalScore,
      endTime: new Date().toISOString(),
      completed: true,
    };
    
    const newAttempts = [...attempts];
    newAttempts[attemptIndex] = updatedAttempt;
    
    setAttempts(newAttempts);
    return updatedAttempt;
  };
  
  return (
    <QuizContext.Provider
      value={{
        quizzes,
        attempts,
        getQuiz,
        getQuizAttempt,
        getQuizAttemptsByQuiz,
        getQuizAttemptsByStudent,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        startQuizAttempt,
        submitQuizAttempt,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};