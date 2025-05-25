import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, FileQuestion, BookOpen, CheckCircle, Play, Award, Eye
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { quizzes, attempts } = useQuiz();
  
  // Filter published quizzes only
  const availableQuizzes = useMemo(() => {
    return quizzes.filter(quiz => quiz.isPublished);
  }, [quizzes]);
  
  // Get attempt info for the current student
  const studentAttempts = useMemo(() => {
    if (!user) return [];
    return attempts.filter(attempt => attempt.studentId === user.id);
  }, [attempts, user]);
  
  // Organize quizzes by completion status
  const { completedQuizzes, incompleteQuizzes } = useMemo(() => {
    if (!user) return { completedQuizzes: [], incompleteQuizzes: [] };
    
    const completedQuizIds = new Set(
      studentAttempts
        .filter(attempt => attempt.completed)
        .map(attempt => attempt.quizId)
    );
    
    return {
      completedQuizzes: availableQuizzes.filter(quiz => completedQuizIds.has(quiz.id)),
      incompleteQuizzes: availableQuizzes.filter(quiz => !completedQuizIds.has(quiz.id)),
    };
  }, [availableQuizzes, studentAttempts, user]);
  
  // Get the most recent attempt for each completed quiz
  const latestAttempts = useMemo(() => {
    return completedQuizzes.reduce((acc, quiz) => {
      const quizAttempts = studentAttempts
        .filter(attempt => attempt.quizId === quiz.id && attempt.completed)
        .sort((a, b) => new Date(b.endTime || 0).getTime() - new Date(a.endTime || 0).getTime());
      
      if (quizAttempts.length > 0) {
        acc[quiz.id] = quizAttempts[0];
      }
      
      return acc;
    }, {} as Record<string, typeof studentAttempts[0]>);
  }, [completedQuizzes, studentAttempts]);
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">
          View and take available quizzes
        </p>
      </div>
      
      {/* Available Quizzes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BookOpen size={20} className="mr-2 text-indigo-600" />
          Available Quizzes
        </h2>
        
        {incompleteQuizzes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              You've completed all available quizzes. Check back later for new ones!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incompleteQuizzes.map(quiz => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {quiz.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Clock size={16} className="mr-1" />
                    <span>{quiz.timeLimit} min</span>
                    <span className="mx-2">•</span>
                    <FileQuestion size={16} className="mr-1" />
                    <span>{quiz.questions.length} questions</span>
                  </div>
                  
                  <Link
                    to={`/student/take-quiz/${quiz.id}`}
                    className="w-full inline-flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <Play size={18} className="mr-2" />
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Completed Quizzes */}
      {completedQuizzes.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-green-600" />
            Completed Quizzes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedQuizzes.map(quiz => {
              const attempt = latestAttempts[quiz.id];
              const score = attempt?.score || 0;
              
              return (
                <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {quiz.title}
                    </h3>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-500">
                        Completed on {new Date(attempt?.endTime || '').toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center">
                        <Award size={18} className={`mr-1 ${
                          score >= 80 ? 'text-amber-500' : 
                          score >= 60 ? 'text-teal-500' : 'text-gray-500'
                        }`} />
                        <span className={`font-semibold ${
                          score >= 80 ? 'text-amber-600' : 
                          score >= 60 ? 'text-teal-600' : 'text-gray-600'
                        }`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/student/results/${attempt?.id}`}
                      className="w-full inline-flex items-center justify-center bg-teal-100 text-teal-700 px-4 py-2 rounded-md hover:bg-teal-200 transition-colors"
                    >
                      <Eye size={18} className="mr-2" />
                      View Results
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;