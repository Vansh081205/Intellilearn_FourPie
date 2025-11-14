import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home, 
  Upload, 
  FileText, 
  Brain, 
  BarChart3, 
  Users, 
  Trophy,
  Settings,
  HelpCircle,
  Sparkles,
  Zap,
  CreditCard,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, currentView, onNavigate }) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', color: 'blue' },
    { id: 'upload', icon: Upload, label: 'Upload', color: 'green' },
    { id: 'courses', icon: BookOpen, label: 'Courses', color: 'indigo' },
    { id: 'summary', icon: FileText, label: 'Summary', color: 'purple' },
    { id: 'quiz', icon: Brain, label: 'Quiz', color: 'pink' },
    { id: 'graph', icon: Sparkles, label: 'Knowledge Map', color: 'yellow' },
    { id: 'playground', icon: Users, label: 'Playground', color: 'orange' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard', color: 'red' },
    { id: 'dashboard', icon: BarChart3, label: 'Analytics', color: 'indigo' },
    { id: 'subscription', icon: CreditCard, label: 'Subscription', color: 'purple' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 glass border-r border-gray-200 dark:border-gray-700 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg gradient-text">IntelliLearn+</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI Learning</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Profile */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    U
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Demo User</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Level 5 Learner</p>
                  </div>
                </div>
                
                {/* XP Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>XP Progress</span>
                    <span>750/1000</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-2">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onNavigate(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-white/20' 
                          : `bg-${item.color}-100 dark:bg-${item.color}-900/30`
                      } group-hover:scale-110 transition-transform`}>
                        <Icon className={
                          isActive 
                            ? 'text-white' 
                            : `text-${item.color}-600 dark:text-${item.color}-400`
                        } size={20} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

              {/* Bottom Items */}
              <div className="space-y-2">
                {bottomItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      whileHover={{ x: 5 }}
                      onClick={onClose}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="font-bold text-orange-700 dark:text-orange-400">7 Day Streak!</div>
                    <div className="text-xs text-orange-600 dark:text-orange-500">Keep it going!</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}