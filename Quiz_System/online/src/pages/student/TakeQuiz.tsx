import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { useAuth } from '../../contexts/AuthContext';
import { Quiz, Question, Answer } from '../../types';
import { 
  ArrowLeft, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getQuiz, startQuizAttempt, submitQuizAttempt } = useQuiz();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState<'start' | 'quiz' | 'submit'>('start');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch quiz data
  useEffect(() => {
    if (id) {
      const quizData = getQuiz(id);
      
      if (quizData) {
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60); // Convert to seconds
        
        // Initialize answers array
        const initialAnswers = quizData.questions.map(question => ({
          questionId: question.id,
          answer: question.questionType === 'multiple-choice' ? -1 : 
                  question.questionType === 'true-false' ? null : '',
        }));
        
        setAnswers(initialAnswers);
      } else {
        navigate('/student');
      }
    }
  }, [id, getQuiz, navigate]);
  
  // Timer functionality
  useEffect(() => {
    if (currentStep !== 'quiz' || !quiz) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentStep, quiz]);
  
  // Handle starting the quiz
  const handleStart = () => {
    if (!quiz || !user) return;
    
    const attempt = startQuizAttempt(quiz.id);
    setAttemptId(attempt.id);
    setCurrentStep('quiz');
  };
  
  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: any) => {
    const newAnswers = [...answers];
    const answerIndex = newAnswers.findIndex(a => a.questionId === questionId);
    
    if (answerIndex !== -1) {
      newAnswers[answerIndex].answer = value;
      setAnswers(newAnswers);
    }
  };
  
  // Navigation between questions
  const goToNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Submit the quiz
  const handleSubmit = async () => {
    if (!quiz || !attemptId) return;
    
    setIsSubmitting(true);
    
    // Filter out unanswered questions
    const answersToSubmit = answers.filter(answer => {
      if (typeof answer.answer === 'number' && answer.answer === -1) return false;
      if (answer.answer === null) return false;
      if (answer.answer === '') return false;
      return true;
    });
    
    const submittedAttempt = submitQuizAttempt(attemptId, answersToSubmit);
    
    if (submittedAttempt) {
      navigate(`/student/results/${submittedAttempt.id}`);
    } else {
      // Handle error
      setIsSubmitting(false);
      setCurrentStep('submit');
    }
  };
  
  if (!quiz) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }
  
  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Get current question
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Get current answer
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  
  // Check if the current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!currentAnswer) return false;
    
    if (typeof currentAnswer.answer === 'number' && currentAnswer.answer === -1) return false;
    if (currentAnswer.answer === null) return false;
    if (currentAnswer.answer === '') return false;
    
    return true;
  };
  
  // Count how many questions are answered
  const answeredQuestionsCount = answers.filter(answer => {
    if (typeof answer.answer === 'number' && answer.answer === -1) return false;
    if (answer.answer === null) return false;
    if (answer.answer === '') return false;
    return true;
  }).length;
  
  return (
    <div>
      {currentStep === 'start' && (
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-6">{quiz.description}</p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6 flex items-center">
            <Clock size={20} className="text-indigo-600 mr-2" />
            <div>
              <p className="font-medium">Time Limit: {quiz.timeLimit} minutes</p>
              <p className="text-sm text-gray-500">
                Once you start, the timer will begin and cannot be paused.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6 flex items-center">
            <CheckCircle size={20} className="text-indigo-600 mr-2" />
            <div>
              <p className="font-medium">{quiz.questions.length} Questions</p>
              <p className="text-sm text-gray-500">
                You can navigate between questions and review your answers before submitting.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleStart}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Start Quiz
          </button>
        </div>
      )}
      
      {currentStep === 'quiz' && currentQuestion && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/student')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            </div>
            
            <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
              <Clock size={16} className="mr-1" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                  <h2 className="text-lg font-semibold text-gray-800 mt-1">
                    {currentQuestion.questionText}
                  </h2>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {currentQuestion.points} points
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {currentQuestion.questionType === 'multiple-choice' && (
                <div className="space-y-3">
                  {(currentQuestion as any).options.map((option: string, index: number) => (
                    <label key={index} className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        checked={currentAnswer?.answer === index}
                        onChange={() => handleAnswerChange(currentQuestion.id, index)}
                        className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-3">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {currentQuestion.questionType === 'true-false' && (
                <div className="space-y-3">
                  <label className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={currentAnswer?.answer === true}
                      onChange={() => handleAnswerChange(currentQuestion.id, true)}
                      className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3">True</span>
                  </label>
                  <label className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={currentAnswer?.answer === false}
                      onChange={() => handleAnswerChange(currentQuestion.id, false)}
                      className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3">False</span>
                  </label>
                </div>
              )}
              
              {currentQuestion.questionType === 'short-answer' && (
                <div>
                  <textarea
                    value={currentAnswer?.answer as string || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your answer"
                    rows={4}
                  />
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
              <button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep('submit')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => {
                const questionAnswer = answers.find(a => a.questionId === quiz.questions[index].id);
                const isAnswered = questionAnswer && (
                  (typeof questionAnswer.answer === 'number' && questionAnswer.answer !== -1) ||
                  questionAnswer.answer === true ||
                  questionAnswer.answer === false ||
                  (typeof questionAnswer.answer === 'string' && questionAnswer.answer.trim() !== '')
                );
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentQuestionIndex === index
                        ? 'bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 'submit' && (
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Review & Submit</h1>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Quiz Progress</span>
              <span className="font-medium text-indigo-600">
                {answeredQuestionsCount} of {quiz.questions.length} questions answered
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${(answeredQuestionsCount / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {answeredQuestionsCount < quiz.questions.length && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-6 flex items-start">
              <AlertTriangle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">You have unanswered questions</p>
                <p className="text-sm">
                  You've answered {answeredQuestionsCount} out of {quiz.questions.length} questions. Unanswered questions will be marked as incorrect.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCurrentStep('quiz')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition-colors font-medium"
            >
              Return to Quiz
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            <p>
              Time remaining: <span className="font-medium">{formatTime(timeLeft)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;