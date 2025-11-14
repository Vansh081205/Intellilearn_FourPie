import { motion, AnimatePresence } from 'framer-motion';
// Added CheckSquare for weekly wins, and Dices for Mastery Score
import { Moon, Sun, Menu, LogOut, User, Mail, Zap, Flame, Trophy, Calendar, CheckSquare, Dices } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function Navbar({ darkMode, setDarkMode, onMenuClick, onEditProfile }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userStats, setUserStats] = useState({
    points: 0,
    streak: 0,
    lastActive: null,
    totalQuizzes: 0,
    // --- NEW ANALYTICS FIELDS ---
    masteryScore: 0,
    quizzesThisWeek: 0,
    winsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  // Refactored to fetch comprehensive analytics
  const fetchUserStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch main dashboard data (for streak, total quizzes, mastery score)
      const dashboardResponse = await axios.get(`${API_BASE_URL}/analytics/dashboard/${user.id}`);
      const dashboardData = dashboardResponse.data.analytics || {};

      // 2. Fetch user profile (for points)
      const profileResponse = await axios.get(`${API_BASE_URL}/user/profile/${user.id}`);
      const profileData = profileResponse.data || {};
      
      // 3. Fetch leaderboard/weekly stats
      const leaderboardResponse = await axios.get(`${API_BASE_URL}/analytics/leaderboard/stats/${user.id}`);
      const leaderboardData = leaderboardResponse.data.stats || {};
      
      setUserStats({
        points: profileData.points || 0,
        // The streak is likely now in the dashboard data
        streak: dashboardData.study_streak || 0,
        lastActive: dashboardData.last_active || null,
        totalQuizzes: dashboardData.total_quizzes || 0,
        
        // New Analytics Fields
        masteryScore: dashboardData.mastery_score ? Math.round(dashboardData.mastery_score) : 0, // Round mastery score
        quizzesThisWeek: leaderboardData.quizzes_this_week || 0,
        winsThisWeek: leaderboardData.wins_this_week || 0,
      });

    } catch (error) {
      console.error('Error fetching user stats:', error.response?.data || error.message);
      // Set defaults on error
      setUserStats({
        points: 0,
        streak: 0,
        lastActive: null,
        totalQuizzes: 0,
        masteryScore: 0,
        quizzesThisWeek: 0,
        winsThisWeek: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchUserStats, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Listen for custom events
  useEffect(() => {
    const handleStatsUpdate = () => {
      fetchUserStats();
    };

    // Ensure the new event listeners are ready to trigger a refresh
    window.addEventListener('pointsUpdated', handleStatsUpdate);
    window.addEventListener('streakUpdated', handleStatsUpdate);
    window.addEventListener('quizCompleted', handleStatsUpdate);
    window.addEventListener('analyticsUpdated', handleStatsUpdate); // Added a general event

    return () => {
      window.removeEventListener('pointsUpdated', handleStatsUpdate);
      window.removeEventListener('streakUpdated', handleStatsUpdate);
      window.removeEventListener('quizCompleted', handleStatsUpdate);
      window.removeEventListener('analyticsUpdated', handleStatsUpdate);
    };
  }, [user?.id]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Get streak display text
  const getStreakDisplay = () => {
    if (loading) return '...';
    if (userStats.streak === 0) return 'Start';
    if (userStats.streak === 1) return '1 day';
    return `${userStats.streak} days`;
  };

  // Get streak color based on value
  const getStreakColor = () => {
    if (userStats.streak === 0) return 'text-gray-500';
    if (userStats.streak < 7) return 'text-orange-500';
    if (userStats.streak < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side - Logo + Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <SignedIn>
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </SignedIn>

            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="text-white" size={18} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  IntelliLearn+
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter - Show for signed in users */}
            <SignedIn>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-800"
              >
                <Flame className={`${getStreakColor()} flex-shrink-0`} size={18} />
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-none">Streak</p>
                  <p className={`text-sm font-bold ${getStreakColor()} leading-none mt-0.5`}>
                    {getStreakDisplay()}
                  </p>
                </div>
                <div className="sm:hidden">
                  <p className={`text-sm font-bold ${getStreakColor()}`}>
                    {userStats.streak}
                  </p>
                </div>
              </motion.div>
            </SignedIn>

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="text-yellow-500" size={18} />
              ) : (
                <Moon className="text-gray-700" size={18} />
              )}
            </motion.button>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="relative user-menu-container">
                {/* User Avatar Button */}
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  aria-label="User menu"
                >
                  <img
                    src={user?.imageUrl}
                    alt={user?.fullName || 'User'}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  />
                  {/* Points Badge */}
                  {userStats.points > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full shadow-lg min-w-[20px] text-center">
                      {userStats.points > 999 ? '999+' : userStats.points}
                    </div>
                  )}
                </motion.button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Header with User Info */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.imageUrl}
                            alt={user?.fullName || 'User'}
                            className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
                          />
                          <div className="text-white flex-1 min-w-0">
                            <p className="font-semibold text-lg truncate">
                              {user?.fullName || 'User'}
                            </p>
                            {user?.username && (
                              <p className="text-sm text-blue-100 truncate">
                                @{user.username}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid: Extended to 5 Metrics + 1 Filler to make 6 */}
                      <div className="p-4 grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-900/50">
                        
                        {/* 1. Points */}
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-1">
                            <Trophy className="text-white" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {userStats.points}
                          </p>
                        </div>

                        {/* 2. Streak */}
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-1">
                            <Flame className="text-white" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {userStats.streak}
                          </p>
                        </div>

                        {/* 3. Total Quizzes */}
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-1">
                            <Zap className="text-white" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Quizzes</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {userStats.totalQuizzes}
                          </p>
                        </div>

                        {/* 4. Mastery Score (NEW ANALYTICS) */}
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-1">
                            <Dices className="text-white" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Mastery</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {userStats.masteryScore}%
                          </p>
                        </div>
                        
                        {/* 5. Quizzes This Week (NEW ANALYTICS) */}
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-1">
                            <Calendar className="text-white" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Quizzes</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {userStats.quizzesThisWeek}
                          </p>
                        </div>
                        
                        {/* 6. Wins This Week (NEW ANALYTICS) */}
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center mx-auto mb-1">
                            <CheckSquare className="text-white" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Weekly Wins</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {userStats.winsThisWeek}
                          </p>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="text-gray-400 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-gray-900 dark:text-gray-100 truncate">
                              {user?.primaryEmailAddress?.emailAddress || 'No email'}
                            </p>
                          </div>
                        </div>

                        {user?.createdAt && (
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="text-gray-400 flex-shrink-0" size={16} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                              <p className="text-gray-900 dark:text-gray-100">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                        {onEditProfile && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onEditProfile();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-left"
                          >
                            <User size={18} />
                            <span className="font-medium">Edit Profile</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                        >
                          <LogOut size={18} />
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;