import {useState, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {
    Brain,
    ChevronRight,
    Trophy,
    Target,
    Clock,
    Zap,
    CheckCircle2,
    XCircle,
    Lightbulb,
    Coins,
    Flame,
    Shield,
    Users,
    Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Confetti from 'react-confetti';
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {io} from 'socket.io-client';
import {API_BASE_URL} from '../../config';

function Quiz({quizData, quizId, userId, onComplete, isMultiplayer = false, roomCode = null, playerName = null}) {
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showConfetti, setShowConfetti] = useState(false);
    const [streak, setStreak] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [lives, setLives] = useState(3);
    const [combo, setCombo] = useState(1);

    // Multiplayer state
    const [players, setPlayers] = useState([]);
    const socketRef = useRef(null);

    // Power-ups state
    const [powerUps, setPowerUps] = useState({
        fiftyFifty: 1,
        timeFreeze: 1,
        shield: 1
    });
    const [usedPowerUp, setUsedPowerUp] = useState(null);
    const [shieldActive, setShieldActive] = useState(false);

    // Analytics session tracking
    const [sessionId, setSessionId] = useState(null);
    const sessionClosedRef = useRef(false);
    const answersRef = useRef([]);
    const powerupUsageRef = useRef([]);
    const scoreRef = useRef(0);

    // Handle both API response formats
    const questions = quizData.questions || quizData;
    const difficulty = quizData.difficulty || 'medium';
    const quiz_id = quizId || quizData.quiz_id || quizData.id;
    const shareLink = quizData.share_link || `/playground/${quiz_id}`;

    const question = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    // Start analytics session when quiz mounts
    useEffect(() => {
        let isMounted = true;

        const startAnalyticsSession = async () => {
            if (!userId || !quiz_id) return;
            try {
                const response = await axios.post(`${API_BASE_URL}/analytics/start-session`, {
                    user_id: userId,
                    quiz_id: quiz_id,
                    difficulty,
                    is_multiplayer: isMultiplayer,
                    room_code: roomCode
                });

                if (isMounted && response.data?.session_id) {
                    setSessionId(response.data.session_id);
                }
            } catch (error) {
                console.error('Failed to start analytics session:', error);
            }
        };

        startAnalyticsSession();

        return () => {
            isMounted = false;
        };
    }, [userId, quiz_id, difficulty, isMultiplayer, roomCode]);

    const finalizeSession = async (overrideAnswers, overrideScore) => {
        if (sessionClosedRef.current || !sessionId) {
            return;
        }

        sessionClosedRef.current = true;

        const finalAnswers = overrideAnswers || answersRef.current;
        const finalScoreValue = overrideScore !== undefined ? overrideScore : scoreRef.current;

        const questionTimings = finalAnswers.map((entry) => ({
            question_index: entry.questionIndex,
            time_taken: entry.timeSpent,
            correct: entry.correct
        }));

        try {
            await axios.post(`${API_BASE_URL}/analytics/end-session`, {
                session_id: sessionId,
                score: finalScoreValue,
                total_questions: questions.length,
                question_timings: questionTimings,
                powerups_used: powerupUsageRef.current,
                final_rank: null
            });
        } catch (error) {
            console.error('Failed to finalize analytics session:', error);
        }
    };

    // Initialize Socket.IO for multiplayer
    useEffect(() => {
        if (isMultiplayer && roomCode) {
            const SOCKET_URL = API_BASE_URL.replace('/api', '');

            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('✅ Quiz connected to socket');
            });

            socket.on('update_room', (roomData) => {
                if (roomData && roomData.players) {
                    const updatedPlayers = roomData.players.map((p, idx) => ({
                        id: p.sid || idx,
                        name: p.name || p.username,
                        score: p.score || 0,
                        streak: p.streak || 0,
                        isYou: (p.name || p.username) === playerName
                    }));
                    setPlayers(updatedPlayers);
                }
            });

            socket.on('player_answered', (data) => {
                toast.success(`${data.username} answered!`, {
                    icon: data.isCorrect ? '✅' : '❌',
                    duration: 1500
                });
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [isMultiplayer, roomCode, playerName]);

    // Timer
    useEffect(() => {
        if (showResult || timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQ, showResult, timeLeft]);

    const handleSubmit = async () => {
        if (!selectedAnswer && timeLeft > 0) {
            toast.error('Please select an answer!');
            return;
        }

        try {
            const timeSpent = Math.max(0, 30 - timeLeft);

            const response = await axios.post(`${API_BASE_URL}/submit-answer`, {
                user_id: userId,
                quiz_id: quiz_id,
                question_index: currentQ,
                answer: selectedAnswer || 'A'
            });

            setResult(response.data);
            setShowResult(true);

            const answerRecord = {
                questionIndex: currentQ,
                userAnswer: selectedAnswer,
                correct: response.data.correct,
                timeSpent
            };
            const updatedAnswers = [...answersRef.current, answerRecord];
            answersRef.current = updatedAnswers;
            setAnswers(updatedAnswers);

            if (response.data.correct) {
                const timeBonus = Math.floor((timeLeft / 30) * 50);
                const comboBonus = combo * 10;
                const earnedPoints = 100 + timeBonus + comboBonus;

                const newScore = score + 1;
                setScore(newScore);
                scoreRef.current = newScore;
                setStreak(streak + 1);
                setCombo(prev => prev + 1);

                const pointsGained = response.data.points_awarded || earnedPoints;
                setPointsEarned(pointsEarned + pointsGained);
                if (response.data.total_points !== undefined) {
                    setTotalPoints(response.data.total_points);
                    window.dispatchEvent(new CustomEvent('pointsUpdated'));
                }

                if (streak >= 2) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                }

                if (isMultiplayer && socketRef.current && roomCode) {
                    socketRef.current.emit('update_score', {
                        room_code: roomCode,
                        username: playerName,
                        delta: earnedPoints,
                        streak: streak + 1,
                        isCorrect: true
                    });

                    socketRef.current.emit('player_answered', {
                        room_code: roomCode,
                        username: playerName,
                        questionId: question.id || currentQ,
                        isCorrect: true
                    });
                }

                if (pointsGained > 0) {
                    toast.success(`🎉 Correct! +${pointsGained} points`, {
                        icon: '✅',
                        style: {background: '#10B981', color: '#fff'}
                    });
                } else {
                    toast.success('🎉 Correct!', {
                        icon: '✅',
                        style: {background: '#10B981', color: '#fff'}
                    });
                }
            } else {
                setStreak(0);
                setCombo(1);

                if (!shieldActive) {
                    const newLives = lives - 1;
                    setLives(newLives);

                    if (newLives === 0) {
                        toast.error('Game Over! No lives left!', {icon: '💔'});
                        await finalizeSession(answersRef.current, scoreRef.current);
                        setTimeout(() => {
                            if (onComplete) onComplete();
                        }, 2000);
                        return;
                    }
                } else {
                    toast.success('Shield protected you! 🛡️', {icon: '✨'});
                    setShieldActive(false);
                }

                if (isMultiplayer && socketRef.current && roomCode) {
                    socketRef.current.emit('update_score', {
                        room_code: roomCode,
                        username: playerName,
                        delta: 0,
                        streak: 0,
                        isCorrect: false
                    });

                    socketRef.current.emit('player_answered', {
                        room_code: roomCode,
                        username: playerName,
                        questionId: question.id || currentQ,
                        isCorrect: false
                    });
                }

                toast.error('Not quite right', {
                    icon: '📚',
                    style: {background: '#F59E0B', color: '#fff'}
                });
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Submission failed: ' + (error.response?.data?.error || error.message));

            setResult({
                correct: false,
                explanation: 'Unable to verify answer. Please check your connection.',
                correct_answer: question.correct
            });
            setShowResult(true);
        }
    };

    const handleNext = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setResult(null);
            setTimeLeft(30);
            setUsedPowerUp(null);
        } else {
            setShowConfetti(true);
        }
    };

    const useFiftyFifty = () => {
        if (powerUps.fiftyFifty > 0 && !usedPowerUp && !showResult) {
            setPowerUps(prev => ({...prev, fiftyFifty: prev.fiftyFifty - 1}));
            setUsedPowerUp('fiftyFifty');
            toast.success('50/50 activated! 🎯 Two wrong answers removed!');
            powerupUsageRef.current = [...powerupUsageRef.current, 'fiftyFifty'];
        }
    };

    const useTimeFreeze = () => {
        if (powerUps.timeFreeze > 0 && !showResult) {
            setPowerUps(prev => ({...prev, timeFreeze: prev.timeFreeze - 1}));
            setTimeLeft(prev => Math.min(prev + 10, 30));
            toast.success('+10 seconds! ⏱️');
            powerupUsageRef.current = [...powerupUsageRef.current, 'timeFreeze'];
        }
    };

    const useShield = () => {
        if (powerUps.shield > 0 && !shieldActive) {
            setPowerUps(prev => ({...prev, shield: prev.shield - 1}));
            setShieldActive(true);
            toast.success('Shield activated! Next wrong answer won\'t cost a life! 🛡️');
            powerupUsageRef.current = [...powerupUsageRef.current, 'shield'];
        }
    };

    const getDifficultyBadge = (diff) => {
        const badges = {
            easy: {color: 'from-green-500 to-emerald-600', emoji: '🌱', label: 'EASY'},
            medium: {color: 'from-yellow-500 to-orange-600', emoji: '🎯', label: 'MEDIUM'},
            hard: {color: 'from-red-500 to-pink-600', emoji: '🚀', label: 'HARD'}
        };
        return badges[diff] || badges.medium;
    };

    const badge = getDifficultyBadge(difficulty);

    const isQuizComplete = currentQ === questions.length - 1 && showResult;
    const finalScore = (score / questions.length) * 100;
    const avgTimePerQuestion = answers.length > 0
        ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length
        : 0;

    const sortedPlayers = isMultiplayer ? [...players].sort((a, b) => b.score - a.score) : [];
    const showLeaderboard = isMultiplayer && players.length > 1;

    const getFilteredOptions = () => {
        if (usedPowerUp !== 'fiftyFifty') return question.options;

        const correctLetter = question.correct;
        let wrongOptions = question.options.filter(opt => opt.charAt(0) !== correctLetter);

        const optionsToKeep = [
            question.options.find(opt => opt.charAt(0) === correctLetter),
            wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
        ];

        return question.options.filter(opt => optionsToKeep.includes(opt));
    };

    const filteredOptions = getFilteredOptions();

    return (
        <div className={`${showLeaderboard ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
            {showConfetti && <Confetti recycle={false} numberOfPieces={500}/>}

            <div className={`grid ${showLeaderboard ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                <div className={showLeaderboard ? 'lg:col-span-2' : 'col-span-1'}>
                    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="card">
                        <div
                            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    {isMultiplayer ? <Users className="text-white" size={28}/> :
                                        <Brain className="text-white" size={28}/>}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{isMultiplayer ? 'Multiplayer Quiz' : 'Adaptive Quiz'}</h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {isMultiplayer ? '🎮 Compete with Friends' : 'AI-Powered Learning Assessment'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                <div
                                    className={`px-4 py-2 bg-gradient-to-r ${badge.color} text-white rounded-xl font-bold shadow-lg flex items-center gap-2`}>
                                    <span className="text-xl">{badge.emoji}</span>
                                    <span>{badge.label}</span>
                                </div>

                                {isMultiplayer && (
                                    <div
                                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2">
                                        {[...Array(3)].map((_, i) => (
                                            <Heart key={i} size={18}
                                                   className={i < lives ? 'fill-white' : 'opacity-30'}/>
                                        ))}
                                    </div>
                                )}

                                <div
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg">
                                    <div className="text-xs opacity-80">SCORE</div>
                                    <div className="text-xl">{score}/{questions.length}</div>
                                </div>

                                {pointsEarned > 0 && (
                                    <motion.div initial={{scale: 0}} animate={{scale: 1}}
                                                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold shadow-lg">
                                        <div className="text-xs opacity-80 flex items-center gap-1">
                                            <Coins size={12}/>
                                            POINTS
                                        </div>
                                        <div className="text-xl">+{pointsEarned}</div>
                                    </motion.div>
                                )}

                                {streak > 0 && (
                                    <motion.div initial={{scale: 0}} animate={{scale: 1}}
                                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg">
                                        <div className="text-xs opacity-80">STREAK</div>
                                        <div className="text-xl flex items-center gap-1">
                                            <Flame size={18}/>
                                            {streak}
                                        </div>
                                    </motion.div>
                                )}

                                {isMultiplayer && combo > 1 && (
                                    <motion.div initial={{scale: 0}} animate={{scale: 1}}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold shadow-lg">
                                        <div className="text-xs opacity-80">COMBO</div>
                                        <div className="text-xl">{combo}x</div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <span className="font-semibold">Question {currentQ + 1} of {questions.length}</span>
                                <span>{Math.round(progress)}% Complete</span>
                            </div>
                            <div
                                className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{width: 0}}
                                    animate={{width: `${progress}%`}}
                                    transition={{duration: 0.5, ease: "easeOut"}}
                                    className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center mb-8">
                            <div className="relative w-24 h-24">
                                <CircularProgressbar
                                    value={(timeLeft / 30) * 100}
                                    text={`${timeLeft}s`}
                                    styles={buildStyles({
                                        pathColor: timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444',
                                        textColor: timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444',
                                        trailColor: '#E5E7EB',
                                        pathTransitionDuration: 0.5,
                                    })}
                                />
                                {timeLeft <= 5 && (
                                    <motion.div animate={{scale: [1, 1.2, 1]}}
                                                transition={{duration: 0.5, repeat: Infinity}}
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Clock className="text-red-500" size={24}/>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={currentQ} initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}}
                                        exit={{opacity: 0, x: -50}} transition={{duration: 0.3}}>
                                <div className="mb-8">
                                    <div
                                        className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-2xl border-2 border-purple-300 dark:border-purple-700 mb-6">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                                {currentQ + 1}
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{question.question}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {filteredOptions.map((option, idx) => {
                                            const letter = option.charAt(0);
                                            const isSelected = selectedAnswer === letter;
                                            const isCorrect = result && letter === result.correct_answer;
                                            const isWrong = result && isSelected && !result.correct;

                                            return (
                                                <motion.button
                                                    key={idx}
                                                    onClick={() => !showResult && setSelectedAnswer(letter)}
                                                    disabled={showResult}
                                                    whileHover={!showResult ? {scale: 1.02, x: 5} : {}}
                                                    whileTap={!showResult ? {scale: 0.98} : {}}
                                                    className={`
                            w-full p-5 text-left rounded-xl border-3 transition-all duration-300 relative overflow-hidden
                            ${isCorrect
                                                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-lg shadow-green-500/50'
                                                        : isWrong
                                                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 shadow-lg shadow-red-500/50'
                                                            : isSelected
                                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg'
                                                                : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                                                    }
                            disabled:cursor-not-allowed
                          `}
                                                >
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                                ${isCorrect
                                                                ? 'bg-green-500 text-white'
                                                                : isWrong
                                                                    ? 'bg-red-500 text-white'
                                                                    : isSelected
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                            }
                              `}>
                                                                {letter}
                                                            </div>
                                                            <span
                                                                className="text-lg font-medium">{option.substring(3)}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {isCorrect && (
                                                                <motion.div initial={{scale: 0}} animate={{scale: 1}}
                                                                            transition={{
                                                                                type: "spring",
                                                                                stiffness: 500,
                                                                                damping: 15
                                                                            }}>
                                                                    <CheckCircle2 className="text-green-500" size={28}/>
                                                                </motion.div>
                                                            )}
                                                            {isWrong && (
                                                                <motion.div initial={{scale: 0}} animate={{scale: 1}}
                                                                            transition={{
                                                                                type: "spring",
                                                                                stiffness: 500,
                                                                                damping: 15
                                                                            }}>
                                                                    <XCircle className="text-red-500" size={28}/>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isSelected && !showResult && (
                                                        <motion.div
                                                            layoutId="selectedOption"
                                                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 -z-10"
                                                            transition={{type: "spring", bounce: 0.2, duration: 0.6}}
                                                        />
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <AnimatePresence>
                            {showResult && result && (
                                <motion.div
                                    initial={{opacity: 0, y: 20, scale: 0.9}}
                                    animate={{opacity: 1, y: 0, scale: 1}}
                                    exit={{opacity: 0, y: -20, scale: 0.9}}
                                    className={`p-6 rounded-2xl mb-6 border-3 ${result.correct
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500'
                                        : 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border-orange-500'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${result.correct ? 'bg-green-500' : 'bg-orange-500'}`}>
                                            {result.correct ? <CheckCircle2 className="text-white" size={28}/> :
                                                <Lightbulb className="text-white" size={28}/>}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className={`text-xl font-bold mb-2 ${result.correct ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                                                {result.correct ? '🎉 Excellent! That\'s Correct!' : '📚 Learning Moment!'}
                                            </h4>

                                            {result.correct && result.points_awarded > 0 && (
                                                <motion.div initial={{scale: 0}} animate={{scale: 1}}
                                                            className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                                                    <Coins className="text-yellow-600" size={20}/>
                                                    <span
                                                        className="font-bold text-yellow-700 dark:text-yellow-400">+{result.points_awarded} IntelliPoints</span>
                                                </motion.div>
                                            )}

                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.explanation}</p>
                                            {!result.correct && (
                                                <div
                                                    className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">💡 <strong>Correct
                                                        Answer: {result.correct_answer}</strong></p>
                                                    {!isMultiplayer && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">The
                                                            AI will adjust your next quiz difficulty based on your
                                                            performance.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isMultiplayer && (
                            <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}}
                                        className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 mb-6">
                                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                                    <Zap className="text-yellow-500" size={20}/>
                                    Power-Ups
                                    {shieldActive && <span
                                        className="ml-auto px-2 py-1 bg-green-500 text-white text-xs rounded-full">🛡️ Shield Active</span>}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={useFiftyFifty}
                                        disabled={powerUps.fiftyFifty === 0 || usedPowerUp !== null || showResult}
                                        className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                                    >
                                        <div className="text-xl mb-1">🎯</div>
                                        <div className="text-xs">50/50</div>
                                        <div className="text-xs opacity-80">{powerUps.fiftyFifty} left</div>
                                    </button>
                                    <button
                                        onClick={useTimeFreeze}
                                        disabled={powerUps.timeFreeze === 0 || showResult}
                                        className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                                    >
                                        <div className="text-xl mb-1">⏱️</div>
                                        <div className="text-xs">+10s</div>
                                        <div className="text-xs opacity-80">{powerUps.timeFreeze} left</div>
                                    </button>
                                    <button
                                        onClick={useShield}
                                        disabled={powerUps.shield === 0 || shieldActive}
                                        className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                                    >
                                        <div className="text-xl mb-1">🛡️</div>
                                        <div className="text-xs">Shield</div>
                                        <div className="text-xs opacity-80">{powerUps.shield} left</div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex gap-4">
                            {!showResult ? (
                                <motion.button
                                    onClick={handleSubmit}
                                    disabled={!selectedAnswer}
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                    className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Target size={24}/>
                                    <span>Submit Answer</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={handleNext}
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                    className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                    {currentQ < questions.length - 1 ? (
                                        <>
                                            <span>Next Question</span>
                                            <ChevronRight size={24}/>
                                        </>
                                    ) : (
                                        <>
                                            <Trophy size={24}/>
                                            <span>See Results</span>
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>

                        {shareLink && !isMultiplayer && (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.5}}
                                        className="mt-6 p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-300 dark:border-gray-600">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">🔗
                                            Challenge Your Friends</p>
                                        <code
                                            className="text-xs bg-white dark:bg-gray-900 px-3 py-1 rounded border block truncate">
                                            {window.location.origin}{shareLink}
                                        </code>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}${shareLink}`);
                                            toast.success('Link copied!');
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {isQuizComplete && (
                            <motion.div
                                initial={{opacity: 0, scale: 0.8}}
                                animate={{opacity: 1, scale: 1}}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        onComplete && onComplete();
                                    }
                                }}
                            >
                                <motion.div initial={{y: 50}} animate={{y: 0}}
                                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                                            onClick={(e) => e.stopPropagation()}>
                                    <div className="text-center">
                                        <motion.div animate={{rotate: [0, 10, -10, 0]}}
                                                    transition={{duration: 0.5, repeat: 3}} className="text-8xl mb-4">
                                            {finalScore >= 80 ? '🏆' : finalScore >= 60 ? '🎯' : '📚'}
                                        </motion.div>

                                        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Here's how you did</p>

                                        <div className="w-40 h-40 mx-auto mb-6">
                                            <CircularProgressbar
                                                value={finalScore}
                                                text={`${Math.round(finalScore)}%`}
                                                styles={buildStyles({
                                                    pathColor: finalScore >= 80 ? '#10B981' : finalScore >= 60 ? '#F59E0B' : '#EF4444',
                                                    textColor: finalScore >= 80 ? '#10B981' : finalScore >= 60 ? '#F59E0B' : '#EF4444',
                                                    trailColor: '#E5E7EB',
                                                    textSize: '24px',
                                                })}
                                            />
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div
                                                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span>Correct Answers</span>
                                                <span className="font-bold text-green-600">{score}</span>
                                            </div>
                                            <div
                                                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span>Total Questions</span>
                                                <span className="font-bold">{questions.length}</span>
                                            </div>
                                            <div
                                                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span>Accuracy</span>
                                                <span
                                                    className="font-bold text-blue-600">{Math.round(finalScore)}%</span>
                                            </div>
                                            {pointsEarned > 0 && (
                                                <div
                                                    className="flex justify-between p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                          <span className="flex items-center gap-2">
                            <Coins className="text-yellow-600" size={18}/>
                            <span>IntelliPoints Earned</span>
                          </span>
                                                    <span className="font-bold text-yellow-600">+{pointsEarned}</span>
                                                </div>
                                            )}
                                            <div
                                                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span>Avg Time/Question</span>
                                                <span
                                                    className="font-bold text-purple-600">{Math.round(avgTimePerQuestion)}s</span>
                                            </div>
                                            <div
                                                className="flex justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span>Best Streak</span>
                                                <span
                                                    className="font-bold text-orange-600">🔥 {Math.max(...answers.map((_, i) => {
                                                    let s = 0;
                                                    for (let j = i; j < answers.length && answers[j].correct; j++) s++;
                                                    return s;
                                                }), 0)}</span>
                                            </div>
                                        </div>

                                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
                                            {finalScore >= 80
                                                ? '🌟 Outstanding performance! You\'re ready for harder challenges!'
                                                : finalScore >= 60
                                                    ? '👍 Good job! Keep practicing to improve further.'
                                                    : '💪 Keep learning! Practice makes perfect!'}
                                        </p>

                                        <button onClick={() => {
                                            finalizeSession(answersRef.current, scoreRef.current);
                                            onComplete && onComplete();
                                        }}
                                                className="btn-primary w-full py-3">
                                            View Dashboard
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {showLeaderboard && (
                    <div className="lg:col-span-1">
                        <motion.div initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}}
                                    className="card sticky top-4 p-4">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={22}/>
                                Live Rankings
                                <span
                                    className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">LIVE</span>
                            </h3>

                            <div className="space-y-2">
                                {sortedPlayers.map((player, idx) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{x: -20, opacity: 0}}
                                        animate={{x: 0, opacity: 1}}
                                        transition={{delay: idx * 0.05}}
                                        className={`p-3 rounded-lg transition-all ${player.isYou ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-100 dark:bg-gray-800'} ${idx === 0 ? 'ring-2 ring-yellow-400' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-base ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-400 text-gray-900' : idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-gray-600 text-white'}`}>
                                                {idx === 0 ? '👑' : idx + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{player.name}</div>
                                                {player.streak > 0 && (
                                                    <div className="text-xs opacity-80 flex items-center gap-1">
                                                        <Flame size={12}/>
                                                        {player.streak} streak
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xl font-black">{player.score}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div
                                className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Your
                                    Performance
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div>
                                        <div
                                            className="text-xl font-bold text-green-600">{answers.filter(q => q.correct).length}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Correct</div>
                                    </div>
                                    <div>
                                        <div
                                            className="text-xl font-bold text-red-600">{answers.filter(q => !q.correct).length}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Wrong</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Quiz;