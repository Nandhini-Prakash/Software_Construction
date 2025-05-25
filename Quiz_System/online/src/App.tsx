import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import CreateQuiz from './pages/teacher/CreateQuiz';
import EditQuiz from './pages/teacher/EditQuiz';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResults from './pages/student/QuizResults';
import ViewResults from './pages/teacher/ViewResults';
import Navbar from './components/Navbar';

// Protected route component that receives auth context from parent
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }
  
  return children;
};

// Separate component to use auth context
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <div className="container mx-auto py-8 px-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/create-quiz" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CreateQuiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/edit-quiz/:id" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <EditQuiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/results/:id" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ViewResults />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/take-quiz/:id" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TakeQuiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/results/:id" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <QuizResults />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuizProvider>
          <AppContent />
        </QuizProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;