import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Brain,
  Zap,
  BookOpen,
  Clock
} from 'lucide-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

function Dashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard/${userId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats if fetch fails
      setStats({
        total_questions: 0,
        accuracy: 0,
        current_level: 'medium',
        message: 'Start taking quizzes to see your analytics!'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualizations (replace with real data from backend)
  const performanceData = [
    { day: 'Mon', accuracy: 65, questions: 12 },
    { day: 'Tue', accuracy: 72, questions: 15 },
    { day: 'Wed', accuracy: 68, questions: 10 },
    { day: 'Thu', accuracy: 78, questions: 18 },
    { day: 'Fri', accuracy: 85, questions: 20 },
    { day: 'Sat', accuracy: 82, questions: 16 },
    { day: 'Sun', accuracy: 88, questions: 14 },
  ];

  const topicDistribution = [
    { name: 'Math', value: 35, color: '#3B82F6' },
    { name: 'Science', value: 25, color: '#10B981' },
    { name: 'History', value: 20, color: '#F59E0B' },
    { name: 'English', value: 20, color: '#8B5CF6' },
  ];

  const difficultyProgress = [
    { difficulty: 'Easy', completed: 45, total: 50 },
    { difficulty: 'Medium', completed: 32, total: 50 },
    { difficulty: 'Hard', completed: 18, total: 50 },
  ];

  const getDifficultyDisplay = (level) => {
    const displays = {
      easy: { emoji: '🌱', label: 'Easy', color: 'green-500' },
      medium: { emoji: '🎯', label: 'Medium', color: 'yellow-500' },
      hard: { emoji: '🚀', label: 'Hard', color: 'red-500' }
    };
    return displays[level] || displays.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🧠</div>
          <p className="text-gray-600 dark:text-gray-400">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-2xl font-bold mb-2">No Data Yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start taking quizzes to see your progress!
        </p>
      </div>
    );
  }

  const accuracy = stats.accuracy || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Your Learning Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and master new concepts
        </p>
      </motion.div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <TrendingUp className="opacity-50" size={20} />
          </div>
          <div className="text-4xl font-bold mb-2">{stats.total_questions}</div>
          <div className="text-blue-100">Questions Attempted</div>
          <div className="mt-3 text-sm opacity-80">
            +12 from last week
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target size={24} />
            </div>
            <div className="w-16 h-16">
              <CircularProgressbar
                value={accuracy}
                strokeWidth={12}
                styles={buildStyles({
                  pathColor: '#fff',
                  trailColor: 'rgba(255,255,255,0.2)',
                })}
              />
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">{accuracy}%</div>
          <div className="text-green-100">Overall Accuracy</div>
          <div className="mt-3 text-sm opacity-80">
            {accuracy >= 80 ? '🔥 Excellent!' : accuracy >= 60 ? '👍 Good!' : '💪 Keep going!'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <Zap className="opacity-50" size={20} />
          </div>
          <div className="text-4xl font-bold mb-2 uppercase">{getDifficultyDisplay(stats.current_level.toLowerCase()).label}</div>
          <div className="text-purple-100">{getDifficultyDisplay(stats.current_level.toLowerCase()).emoji} Current Difficulty</div>
          <div className="mt-3 text-sm opacity-80">
            AI-Adapted Level
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-gradient-to-br from-orange-500 to-red-600 text-white"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={24} />
            </div>
            <div className="text-4xl">🏆</div>
          </div>
          <div className="text-4xl font-bold mb-2">7</div>
          <div className="text-orange-100">Day Streak</div>
          <div className="mt-3 text-sm opacity-80">
            Keep it up!
          </div>
        </motion.div>
      </div>

      {/* AI Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-2 border-indigo-300 dark:border-indigo-700"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Brain className="text-white" size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              🤖 AI Insights
              <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">LIVE</span>
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              {stats.message}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Recommended Action</div>
                <div className="font-semibold">
                  {accuracy >= 80 ? 'Try harder difficulty' : 'Practice more at current level'}
                </div>
              </div>
              <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Next Milestone</div>
                <div className="font-semibold">100 questions</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={24} />
            Weekly Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '2px solid #3B82F6',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorAccuracy)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Topic Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target className="text-green-500" size={24} />
            Learning Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topicDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card lg:col-span-2"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-purple-500" size={24} />
            Progress by Difficulty Level
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={difficultyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="difficulty" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '2px solid #8B5CF6',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="total" fill="#E9D5FF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card"
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="text-orange-500" size={24} />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[
            { time: '2 hours ago', action: 'Completed quiz on Machine Learning', score: 85, icon: '🎯' },
            { time: '1 day ago', action: 'Uploaded document: Data Structures.pdf', score: null, icon: '📄' },
            { time: '2 days ago', action: 'Achieved 7-day learning streak', score: null, icon: '🔥' },
            { time: '3 days ago', action: 'Completed quiz on Python Basics', score: 92, icon: '🏆' },
          ].map((activity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + idx * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-4xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="font-semibold">{activity.action}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock size={14} />
                  {activity.time}
                </p>
              </div>
              {activity.score && (
                <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold">
                  {activity.score}%
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="card bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-300 dark:border-yellow-700"
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award className="text-yellow-600" size={24} />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏆', title: 'Quiz Master', desc: '50 quizzes completed' },
            { icon: '🔥', title: 'Week Warrior', desc: '7-day streak' },
            { icon: '🎯', title: 'Sharp Shooter', desc: '90%+ accuracy' },
            { icon: '🚀', title: 'Fast Learner', desc: 'Hard level unlocked' },
          ].map((achievement, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl text-center shadow-lg cursor-pointer"
            >
              <div className="text-5xl mb-2">{achievement.icon}</div>
              <div className="font-bold text-sm mb-1">{achievement.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{achievement.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;