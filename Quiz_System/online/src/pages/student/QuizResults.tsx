import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { Quiz, QuizAttempt, Question } from '../../types';
import { 
  ArrowLeft, CheckCircle, XCircle, Clock, Award, FileQuestion
} from 'lucide-react';

const QuizResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuizAttempt, getQuiz } = useQuiz();
  
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  useEffect(() => {
    if (id) {
      const attemptData = getQuizAttempt(id);
      
      if (attemptData) {
        setAttempt(attemptData);
        
        const quizData = getQuiz(attemptData.quizId);
        if (quizData) {
          setQuiz(quizData);
        }
      } else {
        navigate('/student');
      }
    }
  }, [id, getQuizAttempt, getQuiz, navigate]);
  
  if (!attempt || !quiz) {
    return <div className="text-center py-8">Loading results...</div>;
  }
  
  // Calculate stats
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = attempt.answers.length;
  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
  const score = attempt.score || 0;
  
  // Calculate time taken
  const startTime = new Date(attempt.startTime).getTime();
  const endTime = new Date(attempt.endTime || new Date()).getTime();
  const timeTakenMs = endTime - startTime;
  const minutes = Math.floor(timeTakenMs / (1000 * 60));
  const seconds = Math.floor((timeTakenMs % (1000 * 60)) / 1000);
  
  // Get correct/incorrect status for each question
  const questionResults = quiz.questions.map(question => {
    const answer = attempt.answers.find(a => a.questionId === question.id);
    return {
      question,
      answer,
      isCorrect: answer?.isCorrect || false,
      isAnswered: !!answer,
      points: answer?.points || 0,
    };
  });
  
  // Get feedback based on score
  const getFeedback = () => {
    if (score >= 90) return { text: 'Excellent!', color: 'text-green-600' };
    if (score >= 80) return { text: 'Great job!', color: 'text-green-600' };
    if (score >= 70) return { text: 'Good work!', color: 'text-teal-600' };
    if (score >= 60) return { text: 'Nice effort!', color: 'text-teal-600' };
    if (score >= 50) return { text: 'You passed!', color: 'text-amber-600' };
    return { text: 'Keep practicing!', color: 'text-red-600' };
  };
  
  const feedback = getFeedback();
  
  // Calculate grade letter
  const getGradeLetter = () => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          to="/student"
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{quiz.title} Results</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <div className="relative mb-2">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-4xl font-bold">{getGradeLetter()}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
              {score}%
            </div>
          </div>
          <h2 className={`text-2xl font-bold ${feedback.color} mt-4`}>
            {feedback.text}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Completed on {new Date(attempt.endTime || '').toLocaleDateString()}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileQuestion size={18} className="mr-2 text-indigo-600" />
            Questions
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions</span>
              <span className="font-medium">{totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Answered</span>
              <span className="font-medium">{answeredQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Correct</span>
              <span className="font-medium text-green-600">{correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Incorrect</span>
              <span className="font-medium text-red-600">{answeredQuestions - correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Skipped</span>
              <span className="font-medium text-yellow-600">{totalQuestions - answeredQuestions}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock size={18} className="mr-2 text-indigo-600" />
            Time
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Time Limit</span>
              <span className="font-medium">{quiz.timeLimit} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Taken</span>
              <span className="font-medium">{minutes}m {seconds}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Time per Question</span>
              <span className="font-medium">
                {Math.round(timeTakenMs / (1000 * totalQuestions) / 60)}m {Math.round((timeTakenMs / (1000 * totalQuestions)) % 60)}s
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Question Review
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Review your answers and see the correct solutions
          </p>
        </div>
        
        <div className="divide-y">
          {questionResults.map(({ question, answer, isCorrect, isAnswered, points }, index) => (
            <div key={question.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <span className="bg-gray-100 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {question.questionText}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {question.questionType === 'multiple-choice' 
                        ? 'Multiple Choice' 
                        : question.questionType === 'true-false'
                        ? 'True/False'
                        : 'Short Answer'}
                      {' • '}{question.points} points
                    </p>
                  </div>
                </div>
                
                {isAnswered ? (
                  isCorrect ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle size={20} className="mr-1" />
                      <span>{points} / {question.points}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle size={20} className="mr-1" />
                      <span>0 / {question.points}</span>
                    </div>
                  )
                ) : (
                  <div className="text-yellow-600 text-sm">Not answered</div>
                )}
              </div>
              
              <div className="ml-9">
                {question.questionType === 'multiple-choice' && (
                  <div className="space-y-2">
                    {(question as any).options.map((option: string, optionIndex: number) => {
                      const isSelected = answer?.answer === optionIndex;
                      const isCorrectOption = (question as any).correctAnswer === optionIndex;
                      
                      return (
                        <div 
                          key={optionIndex} 
                          className={`p-3 rounded-md ${
                            isSelected && isCorrect
                              ? 'bg-green-50 border border-green-200'
                              : isSelected && !isCorrect
                              ? 'bg-red-50 border border-red-200'
                              : isCorrectOption && !isSelected
                              ? 'bg-gray-50 border border-gray-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {isSelected && isCorrect && (
                                <CheckCircle size={16} className="text-green-600" />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle size={16} className="text-red-600" />
                              )}
                              {!isSelected && isCorrectOption && (
                                <CheckCircle size={16} className="text-green-600" />
                              )}
                              {!isSelected && !isCorrectOption && (
                                <span className="w-4 h-4 block"></span>
                              )}
                            </div>
                            <span 
                              className={`${
                                isCorrectOption ? 'font-medium' : ''
                              }`}
                            >
                              {option}
                              {isCorrectOption && !isSelected && (
                                <span className="ml-2 text-sm text-green-600">
                                  (Correct answer)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {question.questionType === 'true-false' && (
                  <div className="space-y-2">
                    {[true, false].map((option, optionIndex) => {
                      const isSelected = answer?.answer === option;
                      const isCorrectOption = (question as any).correctAnswer === option;
                      
                      return (
                        <div 
                          key={optionIndex} 
                          className={`p-3 rounded-md ${
                            isSelected && isCorrect
                              ? 'bg-green-50 border border-green-200'
                              : isSelected && !isCorrect
                              ? 'bg-red-50 border border-red-200'
                              : isCorrectOption && !isSelected
                              ? 'bg-gray-50 border border-gray-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {isSelected && isCorrect && (
                                <CheckCircle size={16} className="text-green-600" />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle size={16} className="text-red-600" />
                              )}
                              {!isSelected && isCorrectOption && (
                                <CheckCircle size={16} className="text-green-600" />
                              )}
                              {!isSelected && !isCorrectOption && (
                                <span className="w-4 h-4 block"></span>
                              )}
                            </div>
                            <span 
                              className={`${
                                isCorrectOption ? 'font-medium' : ''
                              }`}
                            >
                              {option ? 'True' : 'False'}
                              {isCorrectOption && !isSelected && (
                                <span className="ml-2 text-sm text-green-600">
                                  (Correct answer)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {question.questionType === 'short-answer' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Your Answer:</p>
                      <div 
                        className={`p-3 rounded-md ${
                          isCorrect
                            ? 'bg-green-50 border border-green-200'
                            : isAnswered
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {isAnswered ? (
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {isCorrect ? (
                                <CheckCircle size={16} className="text-green-600" />
                              ) : (
                                <XCircle size={16} className="text-red-600" />
                              )}
                            </div>
                            <span>{answer?.answer as string}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No answer provided</span>
                        )}
                      </div>
                    </div>
                    
                    {(!isCorrect || !isAnswered) && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Correct Answer:</p>
                        <div className="p-3 rounded-md bg-green-50 border border-green-200">
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              <CheckCircle size={16} className="text-green-600" />
                            </div>
                            <span>{(question as any).correctAnswer}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mb-8">
        <Link
          to="/student"
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;