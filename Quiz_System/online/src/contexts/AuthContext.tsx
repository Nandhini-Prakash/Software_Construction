import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'teacher' | 'student') => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Teacher Demo',
    email: 'teacher@example.com',
    password: 'password123',
    role: 'teacher' as const,
  },
  {
    id: '2',
    name: 'Student Demo',
    email: 'student@example.com',
    password: 'password123',
    role: 'student' as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('quiz_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  const login = (email: string, password: string, role: 'teacher' | 'student') => {
    // Find user with matching email and password
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    
    if (foundUser) {
      // Create a user object without the password
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('quiz_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('quiz_user');
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};