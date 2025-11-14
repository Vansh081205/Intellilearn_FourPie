import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Target,
  Zap,
  Award,
    Star,
    Loader
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import {API_BASE_URL} from '../../config';

export default function Leaderboard({ userId = 'demo_user' }) {
    const [timeFilter, setTimeFilter] = useState('all-time'); // daily, weekly, monthly, all-time
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [currentUserStats, setCurrentUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalParticipants, setTotalParticipants] = useState(0);

    useEffect(() => {
        fetchLeaderboard();
        fetchUserStats();
    }, [timeFilter, userId]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/analytics/leaderboard`, {
                params: {
                    time_filter: timeFilter,
                    limit: 50,
                    user_id: userId
                }
            });

            if (response.data.success) {
                setLeaderboardData(response.data.leaderboard);
                setTotalParticipants(response.data.total_participants);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/leaderboard/stats/${userId}`);
            if (response.data.success) {
                setCurrentUserStats(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    const getBadgeEmoji = (badge) => {
    const badges = { gold: '👑', silver: '🥈', bronze: '🥉' };
    return badges[badge] || '';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-500 to-indigo-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="text-green-500" size={16} />;
    if (change < 0) return <TrendingUp className="text-red-500 rotate-180" size={16} />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

    const getAvatar = (userId, index) => {
        // Generate consistent avatar based on user ID
        const avatars = ['👨‍💻', '👩‍🎓', '🎯', '👨‍🔬', '👩‍💼', '👨‍🎨', '👩‍🏫', '👨‍💼', '👩‍🔬', '👨‍🎓'];
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return avatars[hash % avatars.length];
    };

    const formatUserName = (userId, isCurrentUser) => {
        if (isCurrentUser) return 'You';
        // Extract readable part from user ID if possible, or generate name
        const shortId = userId.substring(userId.length - 6);
        return `Player ${shortId}`;
    };

    if (loading && leaderboardData.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                        className="text-6xl mb-4"
                    >
                        <Loader className="text-blue-500" size={48}/>
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
                </div>
            </div>
        );
    }

    if (leaderboardData.length === 0) {
        return (
            <div className="card text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-2">No Leaderboard Data Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Be the first to take quizzes and climb the ranks!
                </p>
            </div>
        );
    }

    const topThree = leaderboardData.slice(0, 3);
    const remainingPlayers = leaderboardData.slice(3);

    return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl mb-4 shadow-2xl">
          <Trophy className="text-white" size={40} />
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Global Leaderboard
        </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
          Compete • Climb • Conquer
        </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
              {totalParticipants} active learners competing
          </p>
      </motion.div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Time Filter */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Time Period</label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly', 'all-time'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                    timeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Podium - Top 3 */}
        {topThree.length >= 2 && (
            <div className="grid grid-cols-3 gap-4">
                {/* 2nd Place */}
                {topThree[1] && (
            <motion.div
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2}}
                className="text-center pt-12"
            >
                <div className="relative inline-block mb-4">
                    <motion.div
                        whileHover={{scale: 1.1}}
                        className="text-6xl cursor-pointer"
                    >
                        {getAvatar(topThree[1].user_id, 1)}
                    </motion.div>
                    <div className="absolute -top-2 -right-2 text-4xl">
                        {getBadgeEmoji(topThree[1].badge)}
                    </div>
                </div>
                <div
                    className="bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 rounded-t-2xl p-6 pt-16 -mt-8 shadow-xl">
                    <div className="text-5xl font-bold mb-2">2</div>
                    <div
                        className="font-bold text-lg mb-2">{formatUserName(topThree[1].user_id, topThree[1].is_current_user)}</div>
                    <div className="text-2xl font-bold">{topThree[1].score}</div>
                    <div className="text-sm opacity-90 mb-3">points</div>

                    <div className="flex items-center justify-center gap-2 text-sm">
                        <Zap size={14}/>
                        <span>{topThree[1].study_streak} days</span>
                    </div>
                </div>
            </motion.div>
          )}

            {/* 1st Place */}
            {topThree[0] && (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
                className="text-center"
            >
                <div className="relative inline-block mb-4">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{duration: 2, repeat: Infinity}}
                        className="text-7xl cursor-pointer"
                    >
                        {getAvatar(topThree[0].user_id, 0)}
                    </motion.div>
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 3, repeat: Infinity, ease: "linear"}}
                        className="absolute -top-4 -right-4 text-5xl"
                    >
                        {getBadgeEmoji(topThree[0].badge)}
                    </motion.div>
              </div>
                <div
                    className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-t-2xl p-8 pt-20 -mt-12 shadow-2xl">
                    <motion.div
                        animate={{scale: [1, 1.1, 1]}}
                        transition={{duration: 2, repeat: Infinity}}
                    >
                        <Crown className="mx-auto mb-2" size={32}/>
                    </motion.div>
                    <div className="text-6xl font-bold mb-2">1</div>
                    <div
                        className="font-bold text-xl mb-3">{formatUserName(topThree[0].user_id, topThree[0].is_current_user)}</div>
                    <div className="text-3xl font-bold">{topThree[0].score}</div>
                    <div className="text-sm opacity-90 mb-4">points</div>

                    <div className="flex items-center justify-center gap-2">
                        <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                            🔥 {topThree[0].study_streak} day streak
                        </div>
                    </div>
                </div>
            </motion.div>
          )}

            {/* 3rd Place */}
            {topThree[2] && (
            <motion.div
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.3}}
                className="text-center pt-16"
            >
                <div className="relative inline-block mb-4">
                    <motion.div
                        whileHover={{scale: 1.1}}
                        className="text-6xl cursor-pointer"
                    >
                        {getAvatar(topThree[2].user_id, 2)}
                    </motion.div>
                    <div className="absolute -top-2 -right-2 text-4xl">
                        {getBadgeEmoji(topThree[2].badge)}
                    </div>
                </div>
                <div
                    className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-t-2xl p-6 pt-16 -mt-8 shadow-xl">
                    <div className="text-5xl font-bold mb-2">3</div>
                    <div
                        className="font-bold text-lg mb-2">{formatUserName(topThree[2].user_id, topThree[2].is_current_user)}</div>
                    <div className="text-2xl font-bold">{topThree[2].score}</div>
                    <div className="text-sm opacity-90 mb-3">points</div>

                    <div className="flex items-center justify-center gap-2 text-sm">
                        <Target size={14}/>
                        <span>{topThree[2].study_streak} days</span>
                    </div>
                </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Medal className="text-purple-500" size={28} />
          Full Rankings
        </h3>

        <div className="space-y-3">
          {leaderboardData.map((player, idx) => (
            <motion.div
                key={player.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer
                ${player.is_current_user
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-500 shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {/* Rank */}
              <div className={`
                w-14 h-14 bg-gradient-to-br ${getRankColor(player.rank)} 
                rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg
              `}>
                {player.rank}
              </div>

              {/* Avatar */}
                <div className="text-4xl">{getAvatar(player.user_id, idx)}</div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{formatUserName(player.user_id, player.is_current_user)}</span>
                    {player.is_current_user && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">
                      YOU
                    </span>
                  )}
                  {player.badge && (
                    <span className="text-2xl">{getBadgeEmoji(player.badge)}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Target size={14} />
                      <span>{player.total_quizzes} quizzes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} />
                      <span>{player.accuracy}% avg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={14} />
                      <span>{player.study_streak} day streak</span>
                  </div>
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <span>🧠 {player.mastery_score} mastery</span>
                    </div>
                </div>
              </div>

              {/* Rank Change */}
              <div className="flex items-center gap-2">
                  {getChangeIcon(player.rank_change)}
                  {player.rank_change !== 0 && (
                  <span className={`text-sm font-semibold ${
                      player.rank_change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(player.rank_change)}
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {player.score}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Your Stats Card */}
        {currentUserStats && (
            <div
                className="card bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Award className="text-purple-600" size={24}/>
                    Your Performance This Week
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-2">
                            <CircularProgressbar
                                value={currentUserStats.progress_to_next_level}
                                text={`${Math.round(currentUserStats.progress_to_next_level)}%`}
                                styles={buildStyles({
                                    pathColor: '#8B5CF6',
                                    textColor: '#8B5CF6',
                                    trailColor: '#E9D5FF',
                                })}
                            />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Progress to Next Level</div>
            </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{currentUserStats.wins_this_week}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Quizzes Won</div>
              </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">+{currentUserStats.points_this_week}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Points Gained</div>
              </div>

              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600">🔥 {currentUserStats.current_streak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}