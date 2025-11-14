import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  Users,
  BookOpen,
  BarChart3,
  Upload,
  FileText,
  Trophy,
  Lightbulb,
  PlusCircle,
  Home,
  TrendingUp,
  GraduationCap,
  Target,
  Award,
  Loader,
  CheckCircle,
  Clock,
  Video,
  Calendar,
  Brain,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';

// Components
import Sidebar from '../components/layout/Sidebar';
import ParticleBackground from '../components/animations/ParticleBackground';

// Hooks
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  
  const [currentView, setCurrentView] = useState('home');
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = user?.id || 'demo_teacher';

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Navigation configuration
  const navigation = [
    { id: 'home', name: 'Dashboard', icon: Home, color: 'blue', show: true },
    { id: 'classes', name: 'My Classes', icon: Users, color: 'blue', show: true },
    { id: 'courses', name: 'Courses', icon: BookOpen, color: 'blue', show: true },
    { id: 'students', name: 'Students', icon: GraduationCap, color: 'blue', show: true },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'blue', show: true },
    { id: 'materials', name: 'Materials', icon: FileText, color: 'blue', show: true },
    { id: 'insights', name: 'AI Insights', icon: Lightbulb, color: 'blue', show: true },
  ];

  const visibleNavigation = navigation.filter(item => item.show);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const handleViewChange = (viewId) => {
    setCurrentView(viewId);
    setSidebarOpen(false);
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onNavigate={handleViewChange} userName={user?.firstName || 'Teacher'} />;
      case 'classes':
        return <ClassesView />;
      case 'courses':
        return <CoursesView />;
      case 'students':
        return <StudentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'materials':
        return <MaterialsView />;
      case 'insights':
        return <InsightsView />;
      default:
        return <HomeView onNavigate={handleViewChange} userName={user?.firstName || 'Teacher'} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <ParticleBackground />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        onNavigate={handleViewChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-2xl">
                <GraduationCap className="w-20 h-20 text-white" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Teacher Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.firstName || 'Teacher'}</span>! Ready to inspire minds today?
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 overflow-x-auto"
        >
          <div className="flex justify-between bg-white dark:bg-slate-800 rounded-2xl p-2 gap-2 shadow-xl border border-gray-200 dark:border-slate-700 min-w-full sm:min-w-0 w-full">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700/50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden text-xs">{item.name.split(' ')[0]}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {loading ? <LoadingScreen /> : renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="text-center py-8 text-gray-600 dark:text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-2">Built with ❤️ for educators • Powered by AI</p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeView({ onNavigate, userName }) {
  const features = [
    {
      icon: Users,
      title: 'Manage Classes',
      description: 'Create and organize your classes, track attendance',
      action: () => onNavigate('classes'),
      gradient: 'from-blue-600 to-blue-700'
    },
    {
      icon: BookOpen,
      title: 'Course Creation',
      description: 'Build comprehensive courses with AI assistance',
      action: () => onNavigate('courses'),
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      icon: GraduationCap,
      title: 'Student Management',
      description: 'Monitor student progress and engagement',
      action: () => onNavigate('students'),
      gradient: 'from-cyan-600 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Class Analytics',
      description: 'Detailed insights into class performance',
      action: () => onNavigate('analytics'),
      gradient: 'from-blue-700 to-blue-800'
    },
    {
      icon: FileText,
      title: 'Learning Materials',
      description: 'Upload and manage educational resources',
      action: () => onNavigate('materials'),
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get AI-powered teaching recommendations',
      action: () => onNavigate('insights'),
      gradient: 'from-blue-800 to-cyan-700'
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <motion.button
          onClick={() => onNavigate('courses')}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl hover:from-blue-700 hover:to-blue-900 transition-all inline-flex items-center gap-3"
        >
          <PlusCircle size={24} />
          Create New Course
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={feature.action}
              className="relative group cursor-pointer"
            >
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>
                <div className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                  Explore 
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Teaching Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Classes</div>
          </motion.div>
          <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
            <div className="text-4xl font-bold text-blue-700 dark:text-blue-500 mb-2">124</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
          </motion.div>
          <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
            <div className="text-4xl font-bold text-blue-500 dark:text-blue-300 mb-2">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Courses Created</div>
          </motion.div>
          <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
            <div className="text-4xl font-bold text-blue-800 dark:text-blue-600 mb-2">92%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Performance</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ClassesView() {
  const classes = [
    { id: 1, name: 'Advanced Mathematics', students: 32, color: 'blue', schedule: 'Mon, Wed, Fri 10:00 AM', icon: Target },
    { id: 2, name: 'Physics 101', students: 28, color: 'blue', schedule: 'Tue, Thu 2:00 PM', icon: Lightbulb },
    { id: 3, name: 'Computer Science', students: 35, color: 'cyan', schedule: 'Mon, Wed 1:00 PM', icon: Brain },
    { id: 4, name: 'Chemistry Lab', students: 24, color: 'blue', schedule: 'Fri 3:00 PM', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">My Classes</h2>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transition-all inline-flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Add Class
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls, idx) => {
          const Icon = cls.icon;
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${cls.color}-600 to-${cls.color}-700 flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{cls.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {cls.schedule}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="text-blue-700 dark:text-blue-300 font-bold">{cls.students}</span>
                  <span className="text-blue-600 dark:text-blue-400 text-xs ml-1">students</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg font-semibold hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors">
                  Analytics
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CoursesView() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <BookOpen className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Courses Management</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Create and manage your educational courses</p>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900 transition-all"
      >
        Create New Course
      </motion.button>
    </div>
  );
}

function StudentsView() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <GraduationCap className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Student Management</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Monitor and manage your students</p>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <BarChart3 className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Class Analytics</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Detailed performance insights</p>
    </div>
  );
}

function MaterialsView() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <FileText className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Learning Materials</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Upload and manage educational resources</p>
    </div>
  );
}

function InsightsView() {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-xl border border-gray-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Brain className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">AI Insights</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Get AI-powered teaching recommendations</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-xl border border-gray-200 dark:border-slate-700">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4 inline-block"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Loading...</h3>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  );
}