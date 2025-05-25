import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, KeyRound } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [user, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    const success = login(email, password, role);
    
    if (success) {
      // Redirect happens automatically via the useEffect
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };
  
  // Demo account info for easy testing
  const demoAccounts = [
    { role: 'teacher', email: 'teacher@example.com', password: 'password123' },
    { role: 'student', email: 'student@example.com', password: 'password123' },
  ];
  
  const fillDemoCredentials = (role: 'teacher' | 'student') => {
    const account = demoAccounts.find(acc => acc.role === role);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setRole(role as 'teacher' | 'student');
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-indigo-600 text-white py-6 px-6">
            <div className="flex justify-center mb-2">
              <BookOpen size={48} />
            </div>
            <h1 className="text-2xl font-bold text-center">QuizMaster</h1>
            <p className="text-center text-indigo-100 mt-1">
              The ultimate online quiz platform
            </p>
          </div>
          
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Sign In
            </h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="********"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2">Student</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="teacher"
                      checked={role === 'teacher'}
                      onChange={() => setRole('teacher')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2">Teacher</span>
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 text-center">
                For demo purposes:
              </p>
              <div className="flex justify-center mt-2 space-x-3">
                <button
                  onClick={() => fillDemoCredentials('teacher')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Use Teacher Demo
                </button>
                <button
                  onClick={() => fillDemoCredentials('student')}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Use Student Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;