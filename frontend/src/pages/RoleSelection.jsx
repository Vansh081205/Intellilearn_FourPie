import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  ArrowRight, 
  Brain, 
  Upload,
  BarChart3,
  Gamepad2,
  Eye,
  Network,
  BookOpen,
  Video,
  Calendar,
  Zap,
  CheckCircle,
  Home
} from 'lucide-react';
import ParticleBackground from '../components/animations/ParticleBackground';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [darkMode]);

  const handleRoleSelect = (role) => {
    localStorage.setItem('role', role);
    if (role === 'student') {
      navigate('/student/auth');
    } else {
      navigate('/teacher/auth');
    }
  };

  const roles = [
    {
      name: 'Student',
      role: 'student',
      icon: GraduationCap,
      description: 'Access your personalized learning dashboard',
      highlights: [
        'AI-powered adaptive learning',
        'Competitive quiz playground',
        'Visual knowledge graphs',
        'Focus tracking & analytics'
      ],
      features: [
        { icon: Upload, text: 'Upload docs for AI summaries & quizzes' },
        { icon: Network, text: 'Interactive knowledge graphs' },
        { icon: Gamepad2, text: 'Multiplayer quiz battles' },
        { icon: BarChart3, text: 'Weekly performance analytics' },
        { icon: Eye, text: 'Focus mode with distraction tracking' },
        { icon: Brain, text: 'AI assistant available 24/7' }
      ]
    },
    {
      name: 'Teacher',
      role: 'teacher',
      icon: Users,
      description: 'Manage classes and empower your students',
      highlights: [
        'AI course builder',
        'Video classes & meetings',
        'Automated attendance',
        'Advanced analytics'
      ],
      features: [
        { icon: BookOpen, text: 'Create courses with AI assistance' },
        { icon: Video, text: 'Host live video classes' },
        { icon: Calendar, text: 'Auto-attendance via QR code' },
        { icon: Zap, text: 'Generate unlimited AI quizzes' },
        { icon: BarChart3, text: 'Track student progress & insights' },
        { icon: Gamepad2, text: 'Host playground quiz competitions' }
      ]
    }
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <ParticleBackground />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Role
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Select how you want to use IntelliLearn+
            </p>
          </motion.div>

          {/* Role Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-lg hover:shadow-2xl"
                >
                  {/* Card Header */}
                  <div className="p-8 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {role.name}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {role.description}
                    </p>

                    {/* Highlights */}
                    <div className="grid grid-cols-2 gap-3">
                      {role.highlights.map((highlight, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span>{highlight}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="p-8">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                      Key Features
                    </h3>
                    <ul className="space-y-3 mb-6">
                      {role.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.li 
                            key={idx} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + idx * 0.1 }}
                          >
                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <FeatureIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {feature.text}
                            </span>
                          </motion.li>
                        );
                      })}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => handleRoleSelect(role.role)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Continue as {role.name}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Back Button */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}