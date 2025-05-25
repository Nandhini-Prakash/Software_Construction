import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusCircle, Clock, FileQuestion, Edit, Trash, Eye, Users
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { quizzes, attempts, deleteQuiz } = useQuiz();
  
  // Filter quizzes created by this teacher
  const teacherQuizzes = useMemo(() => {
    if (!user) return [];
    return quizzes.filter(quiz => quiz.teacherId === user.id);
  }, [quizzes, user]);
  
  // Get attempt counts for each quiz
  const quizAttemptCounts = useMemo(() => {
    return teacherQuizzes.reduce((acc, quiz) => {
      const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
      acc[quiz.id] = quizAttempts.length;
      return acc;
    }, {} as Record<string, number>);
  }, [teacherQuizzes, attempts]);
  
  // Handle quiz deletion with confirmation
  const handleDeleteQuiz = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteQuiz(id);
    }
  };
  
  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and analyze your quizzes
          </p>
        </div>
        
        <Link
          to="/teacher/create-quiz"
          className="mt-4 sm:mt-0 inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusCircle size={18} className="mr-2" />
          Create New Quiz
        </Link>
      </div>
      
      {teacherQuizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <FileQuestion size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Quizzes Yet</h2>
          <p className="text-gray-600 mb-6">
            Get started by creating your first quiz for your students.
          </p>
          <Link
            to="/teacher/create-quiz"
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            Create New Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherQuizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {quiz.title}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    quiz.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {quiz.description}
                </p>
                
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Clock size={16} className="mr-1" />
                  <span>{quiz.timeLimit} min</span>
                  <span className="mx-2">•</span>
                  <FileQuestion size={16} className="mr-1" />
                  <span>{quiz.questions.length} questions</span>
                  <span className="mx-2">•</span>
                  <Users size={16} className="mr-1" />
                  <span>{quizAttemptCounts[quiz.id] || 0} attempts</span>
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    to={`/teacher/edit-quiz/${quiz.id}`}
                    className="flex-1 inline-flex items-center justify-center bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Link>
                  
                  <Link
                    to={`/teacher/results/${quiz.id}`}
                    className="flex-1 inline-flex items-center justify-center bg-teal-100 text-teal-700 px-3 py-2 rounded-md hover:bg-teal-200 transition-colors"
                  >
                    <Eye size={16} className="mr-1" />
                    Results
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    className="inline-flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash size={16} />
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;