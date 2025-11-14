import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, {Toaster} from 'react-hot-toast';
import {
  Brain,
  Upload,
  FileText,
  Trophy,
  BarChart3,
  Users,
  Sparkles,
  Menu,
  Home,
  Clock,
  BookOpen,
  Library,
  Target,
  Network,
  Gamepad2,
  Award,
  TrendingUp,
  Zap,
  CheckCircle,
  Inbox,
  Loader,
  Package
} from 'lucide-react';

// Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import DocumentUpload from '../components/features/DocumentUpload';
import Summary from '../components/features/Summary';
import Quiz from '../components/features/Quiz';
import Dashboard from '../components/features/Dashboard';
import EnhancedDashboard from '../components/features/EnhancedDashboard';
import KnowledgeGraph from '../components/features/KnowledgeGraph';
import Playground from '../components/features/Playground';
import Leaderboard from '../components/features/Leaderboard';
import ParticleBackground from '../components/animations/ParticleBackground';
import Confetti from '../components/animations/Confetti';
import ContinueLearning from "../components/features/ContinueLearning"
import AllCourses from '../components/features/AllCourses';
import StudyLibrary from '../components/features/StudyLibrary';

// Hooks
import { useLocalStorage } from '../hooks/useLocalStorage';
import {SignedIn, useUser} from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

function App() {
  // State Management
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState('home');
  const [docData, setDocData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useLocalStorage('userRole', null);
  const [selectedCourse, setSelectedCourse] = useState(null);

    const {user} = useUser();
    const userId = user?.id || 'demo_user';

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
    { id: 'home', name: 'Home', icon: Home, color: 'blue', show: true },
    { id: 'library', name: 'Study Library', icon: Library, color:'blue', show: true},
    { id: 'courses', name: 'Courses', icon: BookOpen, color: 'blue', show: true },
    { id: 'quiz', name: 'Quiz', icon: Brain, color: 'blue', show: !!quizData },
    { id: 'graph', name: 'Knowledge Map', icon: Sparkles, color: 'blue', show: !!docData },
    { id: 'playground', name: 'Playground', icon: Users, color: 'blue', show: true },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy, color: 'blue', show: true },
    { id: 'dashboard', name: 'Analytics', icon: BarChart3, color: 'blue', show: true },
  ];

  const visibleNavigation = navigation.filter(item => item.show);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Navigation handlers
  const handleUploadSuccess = (data) => {
    setDocData(data);
    setCurrentView('summary');
  };

  const handleGenerateQuiz = (quiz) => {
    setQuizData(quiz);
    setCurrentView('quiz');
  };

  const handleQuizComplete = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setCurrentView('dashboard');
    }, 3000);
  };

  const handleRoleSelect = (role) => {
    setUserRole(role);
    toast.success(`Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}!`);
  };

  const handleViewChange = (viewId, data = null) => {
    setCurrentView(viewId);
    setSidebarOpen(false);
    
    // Handle course selection
    if (viewId === 'courses' && data) {
      setSelectedCourse(data);
    } else if (viewId !== 'courses') {
      setSelectedCourse(null);
    }
  };

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onNavigate={handleViewChange} />;

      case 'upload':
        return <DocumentUpload onUploadSuccess={handleUploadSuccess} />;

      case 'library':
        return <StudyLibrary />

      case 'courses':
        return <AllCourses onNavigate={handleViewChange} selectedCourse={selectedCourse} />;

      case 'summary':
        return docData ? (
          <Summary docData={docData} onGenerateQuiz={handleGenerateQuiz} />
        ) : (
          <EmptyState
            title="No Document Found"
            message="Please upload a document first"
            action={() => setCurrentView('upload')}
            actionText="Upload Document"
          />
        );

      case 'quiz':
        return quizData ? (
          <Quiz
            quizData={quizData}
            userId={userId}
            onComplete={handleQuizComplete}
          />
        ) : (
          <EmptyState
            title="No Quiz Available"
            message="Generate a quiz from a document first"
            action={() => setCurrentView('upload')}
            actionText="Get Started"
          />
        );

      case 'graph':
        return docData ? (
          <KnowledgeGraph docData={docData} />
        ) : (
          <EmptyState
            title="No Knowledge Graph"
            message="Upload a document to see the knowledge graph"
            action={() => setCurrentView('upload')}
            actionText="Upload Document"
          />
        );

      case 'playground':
        return <Playground userId={userId} />;

      case 'leaderboard':
        return <Leaderboard userId={userId} />;

      case 'dashboard':
          return <EnhancedDashboard userId={userId}/>;

      default:
        return <HomeView onNavigate={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <ParticleBackground />
      <Confetti active={showConfetti} />
      
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
                <Brain className="w-20 h-20 text-white" />
              </div>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                IntelliLearn+
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              AI-Powered Adaptive Learning that understands{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">how you learn</span>
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 overflow-x-auto"
        >
          <div className="flex justify-between glass rounded-2xl p-2 inline-flex gap-2 shadow-xl min-w-full sm:min-w-0 w-full">
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
          {currentView == "home" && <ContinueLearning onNavigate={handleViewChange} />}
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
          <p className="mb-2">Built with ❤️ for learning • Powered by AI</p>
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

function HomeView({ onNavigate }) {
  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description: 'Upload PDFs, DOCX, or text files and get instant AI summaries',
      action: () => onNavigate('upload'),
      color: 'blue'
    },
    {
      icon: Target,
      title: 'Adaptive Quizzes',
      description: 'AI-generated quizzes that adapt to your learning pace',
      action: () => onNavigate('upload'),
      color: 'blue'
    },
    {
      icon: Network,
      title: 'Knowledge Graphs',
      description: 'Visualize concepts and their relationships',
      action: () => onNavigate('upload'),
      color: 'blue'
    },
    {
      icon: Gamepad2,
      title: 'Playground',
      description: 'Compete with friends in multiplayer quizzes',
      action: () => onNavigate('playground'),
      color: 'blue'
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'Track your progress and climb the rankings',
      action: () => onNavigate('leaderboard'),
      color: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Detailed insights into your learning journey',
      action: () => onNavigate('dashboard'),
      color: 'blue'
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <motion.button
          onClick={() => onNavigate('upload')}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 text-lg rounded-xl inline-flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Upload size={24} />
          Get Started - Upload Document
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
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={feature.action}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl cursor-pointer border border-gray-200 dark:border-slate-700 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
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
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-slate-700">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Platform Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Learners</div>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-blue-700 dark:text-blue-500 mb-2">50K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Generated</div>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-blue-500 dark:text-blue-300 mb-2">95%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
          </motion.div>
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl font-bold text-blue-800 dark:text-blue-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">AI Available</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, message, action, actionText }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-xl border border-gray-200 dark:border-slate-700"
    >
      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      {action && (
        <motion.button
          onClick={action}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
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
            <Brain className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Loading...</h3>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we prepare your content</p>
      </div>
    </div>
  );
}

export default App;