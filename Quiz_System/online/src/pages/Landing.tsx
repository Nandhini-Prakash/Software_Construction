import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  CheckSquare,
  BarChart,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-indigo-200/40 via-white/20 to-indigo-100 pointer-events-none z-0" />

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <BookOpen size={72} className="text-indigo-600 drop-shadow-lg" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6"
          >
            Empower Learning with QuizMaster
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Build interactive quizzes in minutes. Analyze student performance instantly. Designed for classrooms that thrive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <Link
              to="/login"
              className="inline-flex items-center bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg"
            >
              Get Started
              <ArrowRight size={22} className="ml-3" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-extrabold text-center text-gray-900 mb-16"
        >
          Built for Teachers. Loved by Students.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              icon: <CheckSquare size={28} className="text-indigo-600" />,
              title: 'Multiple Question Types',
              desc: 'Create diverse quizzes with multiple-choice, true/false, and short answers.',
            },
            {
              icon: <Clock size={28} className="text-indigo-600" />,
              title: 'Timed Assessments',
              desc: 'Simulate real exams with customizable timers.',
            },
            {
              icon: <BarChart size={28} className="text-indigo-600" />,
              title: 'Detailed Analytics',
              desc: 'Track performance and growth with interactive dashboards.',
            },
            {
              icon: <Award size={28} className="text-indigo-600" />,
              title: 'Instant Grading',
              desc: 'Auto-grade quizzes for quick feedback.',
            },
            {
              icon: <Users size={28} className="text-indigo-600" />,
              title: 'User Management',
              desc: 'Control access with role-based interfaces for students and educators.',
            },
            {
              icon: <BookOpen size={28} className="text-indigo-600" />,
              title: 'Reusable Quiz Library',
              desc: 'Organize quizzes into a customizable and shareable library.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-700 text-white py-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-4"
        >
          <h2 className="text-4xl font-bold mb-4">Start creating quizzes today</h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
            Sign up now and unlock a world of possibilities in digital education.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="bg-white text-indigo-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-50 transition"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-indigo-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-400 transition"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <BookOpen size={32} className="text-indigo-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">QuizMaster</span>
          </div>
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} QuizMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
