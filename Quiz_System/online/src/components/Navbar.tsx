import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show navbar on landing page
  if (location.pathname === '/') {
    return null;
  }
  
  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (!user) {
    return (
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <BookOpen className="mr-2" size={24} />
            QuizMaster
          </Link>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link 
          to={user.role === 'teacher' ? '/teacher' : '/student'} 
          className="text-2xl font-bold flex items-center"
        >
          <BookOpen className="mr-2" size={24} />
          QuizMaster
        </Link>
        
        <div className="flex items-center">
          <span className="mr-4 hidden sm:inline">
            {user.name} ({user.role})
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-md transition-colors"
          >
            <LogOut size={18} className="mr-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;