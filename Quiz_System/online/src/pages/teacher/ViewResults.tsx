import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { Quiz, QuizAttempt } from '../../types';
import { 
  ArrowLeft, User, Clock, Award, FileQuestion, BarChart, Users
} from 'lucide-react';

const ViewResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuiz, getQuizAttemptsByQuiz } = useQuiz();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  useEffect(() => {
    if (id) {
      const quizData = getQuiz(id);
      
      if (quizData) {
        setQuiz(quizData);
        
        const quizAttempts = getQuizAttemptsByQuiz(id);
        if (quizAttempts) {
          setAttempts(quizAttempts.filter(attempt => attempt.completed));
        }
      } else {
        navigate('/teacher');
      }
    }
  }, [id, getQuiz, getQuizAttemptsByQuiz, navigate]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (!attempts.length) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalAttempts: 0,
        averageTimeInMinutes: 0,
      };
    }
    
    const scores = attempts.map(attempt => attempt.score || 0);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    // Calculate average time taken
    let totalTimeMs = 0;
    attempts.forEach(attempt => {
      if (attempt.startTime && attempt.endTime) {
        const startTime = new Date(attempt.startTime).getTime();
        const endTime = new Date(attempt.endTime).getTime();
        totalTimeMs += (endTime - startTime);
      }
    });
    
    const averageTimeInMinutes = Math.round((totalTimeMs / attempts.length) / (1000 * 60));
    
    return {
      averageScore,
      highestScore,
      lowestScore,
      totalAttempts: attempts.length,
      averageTimeInMinutes,
    };
  }, [attempts]);
  
  // Generate score distribution for chart
  const scoreDistribution = useMemo(() => {
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };
    
    attempts.forEach(attempt => {
      const score = attempt.score || 0;
      
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });
    
    return distribution;
  }, [attempts]);
  
  // Calculate question statistics
  const questionStats = useMemo(() => {
    if (!quiz || !attempts.length) return [];
    
    return quiz.questions.map(question => {
      const questionAnswers = attempts.flatMap(attempt => 
        attempt.answers.filter(answer => answer.questionId === question.id)
      );
      
      const totalAnswers = questionAnswers.length;
      const correctAnswers = questionAnswers.filter(answer => answer.isCorrect).length;
      const incorrectAnswers = totalAnswers - correctAnswers;
      
      const percentCorrect = totalAnswers > 0 
        ? Math.round((correctAnswers / totalAnswers) * 100) 
        : 0;
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        totalAnswers,
        correctAnswers,
        incorrectAnswers,
        percentCorrect,
      };
    });
  }, [quiz, attempts]);
  
  if (!quiz) {
    return <div className="text-center py-8">Loading quiz results...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          to="/teacher"
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{quiz.title} Results</h1>
          <p className="text-gray-600">View performance analytics and student attempts</p>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Average Score</h2>
            <Award size={24} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.averageScore}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.averageScore >= 80 ? 'Excellent performance' : 
             stats.averageScore >= 60 ? 'Good performance' : 
             stats.averageScore >= 40 ? 'Average performance' : 'Needs improvement'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Total Attempts</h2>
            <Users size={24} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalAttempts}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalAttempts > 0 ? `From ${attempts.length} students` : 'No attempts yet'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Score Range</h2>
            <BarChart size={24} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            {stats.lowestScore}% - {stats.highestScore}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Min and max scores
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Avg. Time</h2>
            <Clock size={24} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">
            {stats.averageTimeInMinutes} min
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.averageTimeInMinutes < quiz.timeLimit / 2 
              ? 'Students finished quickly' 
              : stats.averageTimeInMinutes < quiz.timeLimit 
              ? 'Average completion time' 
              : 'Students used full time'}
          </p>
        </div>
      </div>
      
      {/* Score Distribution */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart size={20} className="mr-2 text-indigo-600" />
            Score Distribution
          </h2>
          
          <div className="space-y-3">
            {Object.entries(scoreDistribution).map(([range, count]) => {
              const percentage = attempts.length > 0 
                ? Math.round((count / attempts.length) * 100) 
                : 0;
              
              return (
                <div key={range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{range}%</span>
                    <span>{count} students ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Question Analysis */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileQuestion size={20} className="mr-2 text-indigo-600" />
            Question Analysis
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correct
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incorrect
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questionStats.map((stat, index) => (
                  <tr key={stat.questionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {stat.questionText}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600 font-medium">
                        {stat.correctAnswers} ({stat.totalAnswers > 0 ? Math.round((stat.correctAnswers / stat.totalAnswers) * 100) : 0}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-red-600 font-medium">
                        {stat.incorrectAnswers} ({stat.totalAnswers > 0 ? Math.round((stat.incorrectAnswers / stat.totalAnswers) * 100) : 0}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                        <div 
                          className={`h-2.5 rounded-full ${
                            stat.percentCorrect >= 80 ? 'bg-green-500' :
                            stat.percentCorrect >= 60 ? 'bg-teal-500' :
                            stat.percentCorrect >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${stat.percentCorrect}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {stat.percentCorrect}% success rate
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Student Attempts */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <User size={20} className="mr-2 text-indigo-600" />
          Student Attempts
        </h2>
        
        {attempts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No students have attempted this quiz yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attempts.map((attempt) => {
                  // Calculate time taken
                  const startTime = new Date(attempt.startTime).getTime();
                  const endTime = new Date(attempt.endTime || new Date()).getTime();
                  const timeTakenMs = endTime - startTime;
                  const minutes = Math.floor(timeTakenMs / (1000 * 60));
                  const seconds = Math.floor((timeTakenMs % (1000 * 60)) / 1000);
                  
                  return (
                    <tr key={attempt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm mr-3">
                            {attempt.studentId === '2' ? 'S' : 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {attempt.studentId === '2' ? 'Student Demo' : 'Unknown Student'}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {attempt.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`text-sm font-medium ${
                            (attempt.score || 0) >= 80 ? 'text-green-600' :
                            (attempt.score || 0) >= 60 ? 'text-teal-600' :
                            (attempt.score || 0) >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {attempt.score}%
                          </div>
                          <div className="ml-2">
                            {(attempt.score || 0) >= 80 && (
                              <Award size={16} className="text-amber-500" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(attempt.endTime || '').toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(attempt.endTime || '').toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {minutes}m {seconds}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mb-8">
        <Link
          to={`/teacher/edit-quiz/${quiz.id}`}
          className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors mr-3"
        >
          Edit Quiz
        </Link>
        <Link
          to="/teacher"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ViewResults;