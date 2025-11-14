import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {
    TrendingUp,
    Target,
    Award,
    Brain,
    Zap,
    BookOpen,
    Clock,
    Sparkles,
    ChevronRight,
    TrendingDown,
    Activity,
    Calendar,
    BarChart2,
    Lightbulb,
    Star,
    Trophy,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import toast from 'react-hot-toast';
import {API_BASE_URL} from '../../config';

function EnhancedDashboard({userId}) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, insights, recommendations

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/analytics/dashboard/${userId}`);
            if (response.data.success) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                        className="text-6xl mb-4"
                    >
                        🧠
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-200">Loading your AI-powered analytics...</p>
                </div>
            </div>
        );
    }

    if (!dashboardData || !dashboardData.analytics) {
        return (
            <div className="card text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-2">No Data Yet</h3>
                <p className="text-gray-600 dark:text-gray-200">
                    Start taking quizzes to unlock AI-powered insights!
                </p>
            </div>
        );
    }

    const {analytics, insights, recommendations, recent_sessions, adaptive_difficulty} = dashboardData;

    return (
        <div className="space-y-6 text-gray-800 dark:text-gray-200">
            {/* Header with Mastery Score */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white"
            >
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Brain size={40}/>
                                <div>
                                    <h1 className="text-4xl font-black">Your Learning Profile</h1>
                                    <p className="text-indigo-100">AI-Powered Analytics & Insights</p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-3xl font-bold">{analytics.total_quizzes}</div>
                                    <div className="text-sm text-indigo-100">Quizzes Completed</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-3xl font-bold">{analytics.overall_accuracy}%</div>
                                    <div className="text-sm text-indigo-100">Overall Accuracy</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="text-3xl font-bold">{analytics.study_streak}</div>
                                    <div className="text-sm text-indigo-100">Day Streak 🔥</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div
                                        className="text-3xl font-bold uppercase">{adaptive_difficulty.recommended}</div>
                                    <div className="text-sm text-indigo-100">Current Level</div>
                                </div>
                            </div>
                        </div>

                        {/* Mastery Score Circle */}
                        <div className="w-40 h-40 flex-shrink-0">
                            <CircularProgressbar
                                value={analytics.mastery_score}
                                text={`${Math.round(analytics.mastery_score)}`}
                                styles={buildStyles({
                                    textSize: '24px',
                                    pathColor: '#fff',
                                    textColor: '#fff',
                                    trailColor: 'rgba(255,255,255,0.2)',
                                    strokeLinecap: 'round'
                                })}
                            />
                            <div className="text-center mt-2 text-sm font-semibold">Mastery Score</div>
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 text-8xl">🧠</div>
                    <div className="absolute bottom-10 left-10 text-6xl">✨</div>
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    {id: 'overview', label: 'Overview', icon: BarChart2},
                    {id: 'insights', label: 'AI Insights', icon: Lightbulb},
                    {id: 'recommendations', label: 'Suggested Tests', icon: Target}
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            whileHover={{scale: 1.02}}
                            whileTap={{scale: 0.98}}
                            className={`
                px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all
                ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
              `}
                        >
                            <Icon size={20}/>
                            {tab.label}
                        </motion.button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <OverviewTab analytics={analytics} recent_sessions={recent_sessions}/>
                )}
                {activeTab === 'insights' && (
                    <InsightsTab insights={insights} analytics={analytics}/>
                )}
                {activeTab === 'recommendations' && (
                    <RecommendationsTab recommendations={recommendations} userId={userId}/>
                )}
            </AnimatePresence>
        </div>
    );
}

// Overview Tab Component
function OverviewTab({analytics, recent_sessions}) {
    // Prepare chart data
    const difficultyData = [
        {
            difficulty: 'Easy',
            accuracy: analytics.difficulty_breakdown.easy.accuracy,
            attempts: analytics.difficulty_breakdown.easy.attempts
        },
        {
            difficulty: 'Medium',
            accuracy: analytics.difficulty_breakdown.medium.accuracy,
            attempts: analytics.difficulty_breakdown.medium.attempts
        },
        {
            difficulty: 'Hard',
            accuracy: analytics.difficulty_breakdown.hard.accuracy,
            attempts: analytics.difficulty_breakdown.hard.attempts
        }
    ];

    // Performance over time
    const performanceData = recent_sessions.map((session, idx) => ({
        session: `Quiz ${recent_sessions.length - idx}`,
        accuracy: session.total_questions > 0 ? (session.score / session.total_questions * 100) : 0,
        score: session.score
    })).reverse();

    // Radar chart data
    const skillsData = [
        {skill: 'Accuracy', value: analytics.overall_accuracy},
        {skill: 'Consistency', value: analytics.study_streak * 10}, // Scaled
        {skill: 'Mastery', value: analytics.mastery_score},
        {skill: 'Easy Level', value: analytics.difficulty_breakdown.easy.accuracy},
        {skill: 'Medium Level', value: analytics.difficulty_breakdown.medium.accuracy},
        {skill: 'Hard Level', value: analytics.difficulty_breakdown.hard.accuracy || 50}
    ];

    return (
        <motion.div
            key="overview"
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            className="space-y-6"
        >
            {/* Difficulty Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance by Difficulty */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    className="card"
                >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Target className="text-purple-500" size={24}/>
                        Performance by Difficulty
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={difficultyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB"/>
                            <XAxis dataKey="difficulty" stroke="#6B7280"/>
                            <YAxis stroke="#6B7280"/>
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '2px solid #8B5CF6',
                                    borderRadius: '12px'
                                }}
                            />
                            <Bar dataKey="accuracy" fill="#8B5CF6" radius={[8, 8, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-4 space-y-2">
                        {difficultyData.map((item) => (
                            <div key={item.difficulty}
                                 className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-semibold">{item.difficulty}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">{item.attempts} questions</span>
                                    <span className="text-lg font-bold text-purple-600">{item.accuracy}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Skills Radar */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    className="card"
                >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="text-blue-500" size={24}/>
                        Skills Analysis
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={skillsData}>
                            <PolarGrid stroke="#E5E7EB"/>
                            <PolarAngleAxis dataKey="skill" stroke="#6B7280"/>
                            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280"/>
                            <Radar
                                name="Your Skills"
                                dataKey="value"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.6}
                                strokeWidth={2}
                            />
                            <Tooltip/>
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent Performance Trend */}
            {performanceData.length > 0 && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    className="card"
                >
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-green-500" size={24}/>
                        Recent Performance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB"/>
                            <XAxis dataKey="session" stroke="#6B7280"/>
                            <YAxis stroke="#6B7280" domain={[0, 100]}/>
                            <Tooltip
                                contentStyle={{
                                    background: '#fff',
                                    border: '2px solid #10B981',
                                    borderRadius: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#10B981"
                                fillOpacity={1}
                                fill="url(#colorAccuracy)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Study Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{delay: 0.3}}
                    className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="text-white" size={32}/>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600">{analytics.correct_answers}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-200">Correct Answers</div>
                            <div className="text-xs text-green-600 mt-1">Out of {analytics.total_questions} total</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{delay: 0.4}}
                    className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-700"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Clock className="text-white" size={32}/>
                        </div>
                        <div>
                            <div
                                className="text-3xl font-bold text-orange-600">{Math.round(analytics.avg_study_time)}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-200">Avg Minutes/Quiz</div>
                            <div className="text-xs text-orange-600 mt-1">Study efficiency</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{delay: 0.5}}
                    className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700"
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Trophy className="text-white" size={32}/>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-purple-600">{analytics.longest_streak}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-200">Longest Streak</div>
                            <div className="text-xs text-purple-600 mt-1">Personal best! 🏆</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// AI Insights Tab Component
function InsightsTab({insights, analytics}) {
    const getVelocityIcon = () => {
        if (insights.learning_velocity.includes('📈')) return <ArrowUpRight className="text-green-500"/>;
        if (insights.learning_velocity.includes('📉')) return <TrendingDown className="text-red-500"/>;
        return <Activity className="text-blue-500"/>;
    };

    return (
        <motion.div
            key="insights"
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            className="space-y-6"
        >
            {/* Main Insight Card */}
            <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                className="card bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-2 border-indigo-300 dark:border-indigo-700"
            >
                <div className="flex items-start gap-4">
                    <div
                        className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center flex-shrink-0">
                        <Brain className="text-white" size={40}/>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-2xl font-bold">AI Learning Analysis</h2>
                            <span
                                className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full">
                LIVE INSIGHTS
              </span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {insights.overall_status}
                        </p>
                        <p className="text-lg text-gray-700 dark:text-gray-100">
                            {insights.motivational_message}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Learning Velocity */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.1}}
                className="card"
            >
                <div className="flex items-center gap-3 mb-4">
                    {getVelocityIcon()}
                    <h3 className="text-xl font-bold">Learning Velocity</h3>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-100 mb-4">
                    {insights.learning_velocity}
                </p>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Zap className="text-blue-500" size={20}/>
                    <span className="font-semibold">
            Velocity Score: {(analytics.learning_velocity * 100).toFixed(1)}
          </span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strength Areas */}
                {insights.strength_areas && insights.strength_areas.length > 0 && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.2}}
                        className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="text-green-500" size={24}/>
                            <h3 className="text-xl font-bold">Your Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                            {insights.strength_areas.map((strength, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.3 + idx * 0.1}}
                                    className="flex items-start gap-2"
                                >
                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={20}/>
                                    <span className="text-gray-700 dark:text-gray-100">{strength}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Improvement Areas */}
                {insights.improvement_areas && insights.improvement_areas.length > 0 && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.3}}
                        className="card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-700"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="text-orange-500" size={24}/>
                            <h3 className="text-xl font-bold">Growth Opportunities</h3>
                        </div>
                        <ul className="space-y-3">
                            {insights.improvement_areas.map((area, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.4 + idx * 0.1}}
                                    className="flex items-start gap-2"
                                >
                                    <Lightbulb className="text-orange-500 flex-shrink-0 mt-1" size={20}/>
                                    <span className="text-gray-700 dark:text-gray-100">{area}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </div>

            {/* Next Steps */}
            {insights.next_steps && insights.next_steps.length > 0 && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.4}}
                    className="card bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <ChevronRight className="text-blue-500" size={24}/>
                        <h3 className="text-xl font-bold">Recommended Next Steps</h3>
                    </div>
                    <div className="space-y-3">
                        {insights.next_steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{opacity: 0, x: -20}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.5 + idx * 0.1}}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow"
                            >
                                <div
                                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    {idx + 1}
                                </div>
                                <span className="text-lg text-gray-700 dark:text-gray-100">{step}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* AI Predictions */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.5}}
                className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-purple-500" size={24}/>
                    <h3 className="text-xl font-bold">AI Predictions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">Optimal Difficulty</div>
                        <div className="text-2xl font-bold text-purple-600 uppercase">
                            {insights.predictions.next_optimal_difficulty}
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">Projected Mastery (1 week)</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {Math.round(insights.predictions.estimated_mastery_in_week)}%
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">Questions to Level Up</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {insights.predictions.questions_to_next_level}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Recommendations Tab Component
function RecommendationsTab({recommendations, userId}) {
    const getPriorityColor = (priority) => {
        if (priority >= 9) return 'from-red-500 to-orange-500';
        if (priority >= 7) return 'from-yellow-500 to-amber-500';
        return 'from-blue-500 to-cyan-500';
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'targeted_practice':
                return '🎯';
            case 'level_up':
                return '🚀';
            case 'streak_saver':
                return '🔥';
            case 'milestone_review':
                return '🏆';
            case 'document_practice':
                return '📚';
            default:
                return '✨';
        }
    };

    return (
        <motion.div
            key="recommendations"
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            className="space-y-6"
        >
            <div
                className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="text-purple-500" size={28}/>
                    <h2 className="text-2xl font-bold">AI-Curated Quiz Recommendations</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-200">
                    Personalized suggestions based on your learning patterns and performance data
                </p>
            </div>

            {recommendations && recommendations.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {recommendations.map((rec, idx) => (
                        <motion.div
                            key={idx}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: idx * 0.1}}
                            whileHover={{scale: 1.02, y: -2}}
                            className="card cursor-pointer hover:shadow-2xl transition-all"
                        >
                            <div className="flex items-start gap-4">
                                {/* Priority Badge */}
                                <div
                                    className={`w-16 h-16 bg-gradient-to-br ${getPriorityColor(rec.priority)} rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-3xl`}>
                                    {getTypeIcon(rec.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">{rec.topic}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            rec.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                rec.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                        }`}>
                          {rec.difficulty}
                        </span>
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14}/>
                                                    {rec.estimated_time}
                        </span>
                                            </div>
                                        </div>
                                        <span
                                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                      Priority #{rec.priority}
                    </span>
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-100 mb-3">
                                        {rec.reason}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                            <Award size={16}/>
                                            {rec.potential_gain}
                                        </div>
                                        <button
                                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2">
                                            Start Quiz
                                            <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="card text-center py-12"
                >
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold mb-2">No Recommendations Yet</h3>
                    <p className="text-gray-600 dark:text-gray-200">
                        Complete more quizzes to unlock personalized AI recommendations!
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}

export default EnhancedDashboard;