import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Trophy,
    Copy,
    Crown,
    Timer,
    Zap,
    Target,
    CheckCircle,
    XCircle,
    Star,
    Award,
    TrendingUp,
    Flame,
    Shield,
    Heart,
    Wifi,
    WifiOff,
    Sparkles,
    Medal,
    Swords,
    Rocket,
    Brain,
    ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Confetti from '../animations/Confetti';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../config';

// Hardcoded quiz questions
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2,
        points: 100,
        timeLimit: 15,
        difficulty: "easy"
    },
    {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1,
        points: 100,
        timeLimit: 15,
        difficulty: "easy"
    },
    {
        id: 3,
        question: "Who painted the Mona Lisa?",
        options: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2,
        points: 150,
        timeLimit: 15,
        difficulty: "medium"
    },
    {
        id: 4,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3,
        points: 100,
        timeLimit: 15,
        difficulty: "easy"
    },
    {
        id: 5,
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2,
        points: 150,
        timeLimit: 15,
        difficulty: "medium"
    },
    {
        id: 6,
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2,
        points: 200,
        timeLimit: 12,
        difficulty: "hard"
    },
    {
        id: 7,
        question: "Which programming language is known as the 'mother of all languages'?",
        options: ["Java", "C", "Python", "Assembly"],
        correct: 1,
        points: 150,
        timeLimit: 15,
        difficulty: "medium"
    },
    {
        id: 8,
        question: "What is the speed of light?",
        options: ["299,792 km/s", "150,000 km/s", "500,000 km/s", "100,000 km/s"],
        correct: 0,
        points: 200,
        timeLimit: 12,
        difficulty: "hard"
    },
    {
        id: 9,
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1,
        points: 100,
        timeLimit: 15,
        difficulty: "easy"
    },
    {
        id: 10,
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2,
        points: 150,
        timeLimit: 15,
        difficulty: "medium"
    }
];

const AVATARS = ['🎯', '👨‍💻', '👩‍🎓', '👨‍🎨', '👩‍💼', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🎮', '⚡', '🔥', '💎'];

const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Blood', icon: '🎯', desc: 'First correct answer' },
    { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Answer in under 3 seconds' },
    { id: 'perfectionist', name: 'Perfectionist', icon: '💯', desc: 'Get 100% accuracy' },
    { id: 'comeback_king', name: 'Comeback King', icon: '👑', desc: 'Win from last place' },
    { id: 'untouchable', name: 'Untouchable', icon: '🛡️', desc: 'No wrong answers' },
    { id: 'streak_master', name: 'Streak Master', icon: '🔥', desc: '5+ answer streak' },
];

const COMBO_MESSAGES = [
    { min: 3, message: 'GREAT!', color: 'text-green-500', icon: '🎯' },
    { min: 5, message: 'AMAZING!', color: 'text-blue-500', icon: '⚡' },
    { min: 7, message: 'INCREDIBLE!', color: 'text-purple-500', icon: '🔥' },
    { min: 10, message: 'LEGENDARY!', color: 'text-yellow-500', icon: '👑' },
];

function Playground({ userId }) {
    const [gameState, setGameState] = useState('lobby');
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('Player' + Math.floor(Math.random() * 1000));
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [combo, setCombo] = useState(1);
    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [lives, setLives] = useState(3);
    const [powerUps, setPowerUps] = useState({ fiftyFifty: 1, timeFreeze: 1, shield: 1 });
    const [usedPowerUp, setUsedPowerUp] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    // New gamification states
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [showAchievement, setShowAchievement] = useState(null);
    const [showComboMessage, setShowComboMessage] = useState(null);
    const [answerTimeStart, setAnswerTimeStart] = useState(null);
    const [perfectGame, setPerfectGame] = useState(true);
    const [screenShake, setScreenShake] = useState(false);
    const [scorePopups, setScorePopups] = useState([]);

    const socketRef = useRef(null);
    const createRoomTimeoutRef = useRef(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        const SOCKET_URL = API_BASE_URL.replace('/api', '');
        
        console.log('🔌 Connecting to Socket.IO server:', SOCKET_URL);

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            timeout: 20000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setIsConnected(true);
            toast.success('🎮 Ready to Battle!', { 
                icon: '✅',
                style: { borderRadius: '10px', background: '#10B981', color: '#fff' }
            });
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setIsConnected(false);
            toast.error(`Connection failed: ${error.message}`, { icon: '❌', duration: 5000 });
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from server. Reason:', reason);
            setIsConnected(false);
            toast.error('Disconnected from server', { icon: '🔌' });
        });

        socket.on('room_created', (data) => {
            console.log('🎮 Room created event received:', data);
            setRoomCode(data.room_code);
            setGameState('waiting');
            setIsHost(true);

            if (createRoomTimeoutRef.current) {
                clearTimeout(createRoomTimeoutRef.current);
                createRoomTimeoutRef.current = null;
            }
            toast.success(`🎮 Battle Arena Created!\nCode: ${data.room_code}`, { 
                id: 'creating-room', 
                duration: 4000,
                style: { borderRadius: '10px' }
            });
        });

        socket.on('player_joined', (data) => {
            console.log('👋 Player joined:', data);
            toast.success(`👋 ${data.username} entered the arena!`, { 
                icon: '⚔️',
                style: { borderRadius: '10px' }
            });
        });

        socket.on('update_room', (roomData) => {
            console.log('📊 Room update received:', roomData);
            
            if (!roomData || !roomData.players) {
                console.error('❌ Invalid room data:', roomData);
                return;
            }
            
            const updatedPlayers = roomData.players.map((p, idx) => ({
                id: p.sid || idx,
                name: p.name || p.username,
                score: p.score || 0,
                avatar: p.avatar || AVATARS[idx % AVATARS.length],
                streak: p.streak || 0,
                isYou: (p.name || p.username) === playerName
            }));
            
            setPlayers(updatedPlayers);
        });

        socket.on('game_started', () => {
            console.log('🚀 Game started!');
            setGameState('playing');
            setCurrentQuestion(0);
            setScore(0);
            setStreak(0);
            setCombo(1);
            setAnsweredQuestions([]);
            setLives(3);
            setTimeLeft(QUIZ_QUESTIONS[0].timeLimit);
            setSelectedAnswer(null);
            setUsedPowerUp(null);
            setPerfectGame(true);
            setAnswerTimeStart(Date.now());
            
            toast.success('⚔️ BATTLE BEGINS!', { 
                icon: '🚀',
                style: { 
                    borderRadius: '10px', 
                    background: '#1E40AF', 
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 'bold'
                }
            });
        });

        socket.on('question_next', (data) => {
            console.log('➡️ Moving to next question:', data.questionIndex);
            setCurrentQuestion(data.questionIndex);
            setTimeLeft(QUIZ_QUESTIONS[data.questionIndex].timeLimit);
            setSelectedAnswer(null);
            setUsedPowerUp(null);
            setAnswerTimeStart(Date.now());
        });

        return () => {
            console.log('🔌 Disconnecting socket...');
            socket.disconnect();
        };
    }, [playerName]);

    // Timer countdown effect
    useEffect(() => {
        if (gameState !== 'playing' || selectedAnswer !== null) return;

        if (timeLeft <= 0) {
            handleTimeout();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft, selectedAnswer]);

    // XP and Level System
    const addXP = (amount) => {
        const newXP = xp + amount;
        const xpNeeded = level * 100;
        
        if (newXP >= xpNeeded) {
            setLevel(prev => prev + 1);
            setXp(newXP - xpNeeded);
            setTotalXP(prev => prev + amount);
            
            toast.success(`🎊 LEVEL UP! You're now Level ${level + 1}!`, {
                icon: '⬆️',
                duration: 4000,
                style: { 
                    borderRadius: '10px',
                    background: 'linear-gradient(to right, #8B5CF6, #EC4899)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            });
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        } else {
            setXp(newXP);
            setTotalXP(prev => prev + amount);
        }
    };

    // Achievement System
    const unlockAchievement = (achievementId) => {
        if (!achievements.includes(achievementId)) {
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                setAchievements(prev => [...prev, achievementId]);
                setShowAchievement(achievement);
                addXP(50);
                
                toast.success(`🏆 Achievement Unlocked!\n${achievement.name}`, {
                    icon: achievement.icon,
                    duration: 5000,
                    style: { 
                        borderRadius: '10px',
                        background: '#F59E0B',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                
                setTimeout(() => setShowAchievement(null), 5000);
            }
        }
    };

    // Score Popup Animation
    const showScorePopup = (points, x, y) => {
        const id = Date.now();
        setScorePopups(prev => [...prev, { id, points, x, y }]);
        setTimeout(() => {
            setScorePopups(prev => prev.filter(p => p.id !== id));
        }, 2000);
    };

    const createRoom = () => {
        if (!socketRef.current || !socketRef.current.connected) {
            toast.error('⚠️ Not connected to server! Please wait...', { 
                icon: '❌',
                style: { borderRadius: '10px' }
            });
            return;
        }
        
        const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        
        socketRef.current.emit('create_room', {
            username: playerName,
            avatar: avatar
        });
        
        toast.loading('🎮 Creating Battle Arena...', { 
            id: 'creating-room',
            style: { borderRadius: '10px' }
        });

        if (createRoomTimeoutRef.current) {
            clearTimeout(createRoomTimeoutRef.current);
        }

        createRoomTimeoutRef.current = setTimeout(() => {
            if (gameState === 'lobby') {
                toast.error('⏱️ Timeout! Please try again.', { id: 'creating-room' });
            } else {
                toast.dismiss('creating-room');
            }
            createRoomTimeoutRef.current = null;
        }, 20000);
    };

    const joinRoom = () => {
        if (!socketRef.current || !socketRef.current.connected) {
            toast.error('⚠️ Not connected to server!', { icon: '❌' });
            return;
        }
        
        if (roomCode.length === 6) {
            const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
            
            socketRef.current.emit('join_room', {
                room_code: roomCode,
                username: playerName,
                avatar: avatar
            });
            setGameState('waiting');
        } else {
            toast.error('⚠️ Enter a valid 6-character code!', { 
                icon: '❌',
                style: { borderRadius: '10px' }
            });
        }
    };

    const startGame = () => {
        if (!socketRef.current || !socketRef.current.connected) {
            toast.error('⚠️ Not connected!', { icon: '❌' });
            return;
        }
        
        socketRef.current.emit('start_game', { room_code: roomCode });
    };

    const handleAnswer = (answerIndex) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answerIndex);
        const question = QUIZ_QUESTIONS[currentQuestion];
        const isCorrect = answerIndex === question.correct;
        
        const answerTime = (Date.now() - answerTimeStart) / 1000;

        let earnedPoints = 0;

        if (isCorrect) {
            // Calculate points
            const timeBonus = Math.floor((timeLeft / question.timeLimit) * 50);
            const comboBonus = combo * 10;
            const streakBonus = streak >= 5 ? 50 : 0;
            earnedPoints = question.points + timeBonus + comboBonus + streakBonus;

            setScore(prev => prev + earnedPoints);
            setStreak(prev => prev + 1);
            setCombo(prev => prev + 1);
            
            // Add XP
            addXP(earnedPoints / 10);

            // Show score popup
            showScorePopup(earnedPoints, window.innerWidth / 2, window.innerHeight / 2);

            // Check for achievements
            if (answeredQuestions.length === 0) {
                unlockAchievement('first_blood');
            }
            
            if (answerTime < 3) {
                unlockAchievement('speed_demon');
            }
            
            if (streak + 1 >= 5) {
                unlockAchievement('streak_master');
            }

            // Show combo message
            const comboMsg = COMBO_MESSAGES.filter(c => combo + 1 >= c.min).pop();
            if (comboMsg && combo >= 2) {
                setShowComboMessage(comboMsg);
                setTimeout(() => setShowComboMessage(null), 2000);
            }

            toast.success(`🎯 +${earnedPoints} points!`, { 
                icon: '✨',
                duration: 2000,
                style: { 
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

            if (streak >= 2) {
                toast.success(`🔥 ${streak + 1}x STREAK!`, { 
                    duration: 2000,
                    style: { 
                        borderRadius: '10px',
                        background: '#F59E0B',
                        color: '#fff'
                    }
                });
            }
        } else {
            setPerfectGame(false);
            setStreak(0);
            setCombo(1);
            const newLives = lives - 1;
            setLives(newLives);
            
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 500);

            toast.error('❌ Wrong Answer!', { 
                icon: '😞',
                style: { borderRadius: '10px' }
            });

            if (newLives === 0) {
                toast.error('💔 GAME OVER!', { 
                    icon: '☠️',
                    duration: 3000,
                    style: { 
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }
                });
                setTimeout(() => endGame(), 2000);
                return;
            }
        }

        socketRef.current.emit('update_score', {
            room_code: roomCode,
            username: playerName,
            delta: earnedPoints,
            streak: isCorrect ? streak + 1 : 0,
            isCorrect: isCorrect
        });

        socketRef.current.emit('player_answered', {
            room_code: roomCode,
            username: playerName,
            questionId: question.id,
            isCorrect: isCorrect
        });

        setAnsweredQuestions(prev => [...prev, {
            questionId: question.id,
            correct: isCorrect,
            earnedPoints: earnedPoints
        }]);

        setTimeout(() => {
            if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
                if (isHost) {
                    socketRef.current.emit('next_question', {
                        room_code: roomCode,
                        questionIndex: currentQuestion + 1
                    });
                }
            } else {
                endGame();
            }
        }, 2000);
    };

    const handleTimeout = () => {
        toast.error('⏰ Time\'s Up!', { 
            icon: '⏱️',
            style: { borderRadius: '10px' }
        });
        
        setPerfectGame(false);
        const newLives = lives - 1;
        setLives(newLives);
        setStreak(0);
        setCombo(1);
        
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);

        socketRef.current.emit('update_score', {
            room_code: roomCode,
            username: playerName,
            delta: 0,
            streak: 0,
            isCorrect: false
        });

        if (newLives === 0) {
            toast.error('💔 GAME OVER!', { 
                icon: '☠️',
                duration: 3000,
                style: { 
                    borderRadius: '10px',
                    background: '#EF4444',
                    color: '#fff'
                }
            });
            setTimeout(() => endGame(), 2000);
            return;
        }

        setTimeout(() => {
            if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
                if (isHost) {
                    socketRef.current.emit('next_question', {
                        room_code: roomCode,
                        questionIndex: currentQuestion + 1
                    });
                }
            } else {
                endGame();
            }
        }, 2000);
    };

    const endGame = () => {
        socketRef.current.emit('end_game', { room_code: roomCode });
        setGameState('results');

        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const playerRank = sortedPlayers.findIndex(p => p.isYou) + 1;

        if (playerRank === 1) {
            setShowConfetti(true);
            unlockAchievement('comeback_king');
            addXP(200);
            
            toast.success('👑 CHAMPION! YOU WON!', { 
                duration: 5000,
                icon: '🏆',
                style: { 
                    borderRadius: '10px',
                    background: 'linear-gradient(to right, #F59E0B, #EF4444)',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }
            });
            setTimeout(() => setShowConfetti(false), 8000);
        }
        
        if (perfectGame && answeredQuestions.every(q => q.correct)) {
            unlockAchievement('perfectionist');
            unlockAchievement('untouchable');
        }
    };

    const useFiftyFifty = () => {
        if (powerUps.fiftyFifty > 0 && !usedPowerUp) {
            setPowerUps(prev => ({ ...prev, fiftyFifty: prev.fiftyFifty - 1 }));
            setUsedPowerUp('fiftyFifty');
            toast.success('🎯 50/50 Activated!', {
                style: { borderRadius: '10px', background: '#3B82F6', color: '#fff' }
            });
        }
    };

    const useTimeFreeze = () => {
        if (powerUps.timeFreeze > 0 && !usedPowerUp) {
            setPowerUps(prev => ({ ...prev, timeFreeze: prev.timeFreeze - 1 }));
            setTimeLeft(prev => prev + 10);
            toast.success('⏱️ +10 Seconds!', {
                style: { borderRadius: '10px', background: '#8B5CF6', color: '#fff' }
            });
        }
    };

    const useShield = () => {
        if (powerUps.shield > 0) {
            setPowerUps(prev => ({ ...prev, shield: prev.shield - 1 }));
            toast.success('🛡️ Shield Activated!', {
                style: { borderRadius: '10px', background: '#10B981', color: '#fff' }
            });
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        toast.success('📋 Code Copied!', {
            style: { borderRadius: '10px' }
        });
    };

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const currentQ = QUIZ_QUESTIONS[currentQuestion];
    const xpPercentage = (xp / (level * 100)) * 100;

    return (
        <motion.div 
            className={`min-h-screen ${screenShake ? 'animate-shake' : ''}`}
            animate={screenShake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
        >
            <Confetti active={showConfetti} />

            {/* Connection Status */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed top-4 right-4 z-50"
            >
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm ${
                    isConnected
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white animate-pulse'
                }`}>
                    {isConnected ? (
                        <>
                            <Wifi size={18} />
                            <span className="font-bold text-sm">LIVE</span>
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        </>
                    ) : (
                        <>
                            <WifiOff size={18} />
                            <span className="font-bold text-sm">OFFLINE</span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Achievement Popup */}
            <AnimatePresence>
                {showAchievement && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -100 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl">{showAchievement.icon}</div>
                                <div>
                                    <div className="text-2xl font-black">ACHIEVEMENT UNLOCKED!</div>
                                    <div className="text-lg font-semibold">{showAchievement.name}</div>
                                    <div className="text-sm opacity-90">{showAchievement.desc}</div>
                                </div>
                                <Trophy className="text-yellow-200" size={40} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Combo Message */}
            <AnimatePresence>
                {showComboMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
                    >
                        <div className={`text-8xl font-black ${showComboMessage.color} drop-shadow-2xl flex items-center gap-4`}>
                            <span className="text-9xl">{showComboMessage.icon}</span>
                            <span className="animate-pulse">{showComboMessage.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Score Popups */}
            <AnimatePresence>
                {scorePopups.map(popup => (
                    <motion.div
                        key={popup.id}
                        initial={{ opacity: 1, y: 0, scale: 0.5 }}
                        animate={{ opacity: 0, y: -100, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="fixed z-50 pointer-events-none"
                        style={{ left: popup.x, top: popup.y }}
                    >
                        <div className="text-5xl font-black text-yellow-400 drop-shadow-2xl">
                            +{popup.points}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* LOBBY VIEW */}
            {gameState === 'lobby' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto px-4 py-8"
                >
                    {/* Epic Header */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-center mb-12 relative"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="inline-block relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 blur-3xl opacity-50 animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <Trophy className="text-white" size={48} />
                            </div>
                        </motion.div>

                        <motion.h1 
                            className="text-6xl md:text-7xl font-black mt-6 mb-4"
                            animate={{ 
                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 5, repeat: Infinity }}
                            style={{
                                backgroundImage: 'linear-gradient(to right, #F59E0B, #EF4444, #EC4899, #8B5CF6)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            QUIZ ARENA
                        </motion.h1>
                        
                        <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                            ⚔️ Battle • Compete • Dominate ⚔️
                        </p>
                        
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold text-sm">
                                Level {level}
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-sm">
                                {totalXP} XP
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold text-sm">
                                {achievements.length} Achievements
                            </div>
                        </div>
                    </motion.div>

                    {/* Player Name Input */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="card mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                    >
                        <label className="flex text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 items-center gap-2">
                            <Swords size={20} />
                            YOUR BATTLE NAME
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="input-field text-xl font-black text-center tracking-wide uppercase"
                            placeholder="ENTER NAME"
                            maxLength={15}
                        />
                    </motion.div>

                    {/* Quick Play - MEGA Button */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={createRoom}
                        className="card bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white mb-8 cursor-pointer p-8 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative text-center">
                            <motion.div
                                animate={{ 
                                    y: [0, -15, 0],
                                    rotate: [0, 10, -10, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-7xl mb-4 drop-shadow-2xl"
                            >
                                ⚡
                            </motion.div>
                            <h3 className="text-4xl font-black mb-2 drop-shadow-lg">QUICK BATTLE</h3>
                            <p className="text-lg opacity-90 mb-6">Jump into action instantly!</p>
                            <div className="flex flex-wrap justify-center gap-3 text-sm">
                                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold flex items-center gap-2">
                                    <Target size={16} /> 10 Questions
                                </span>
                                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold flex items-center gap-2">
                                    <Zap size={16} /> Fast Paced
                                </span>
                                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold flex items-center gap-2">
                                    <Crown size={16} /> Multiplayer
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Create or Join Room */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ y: -5 }}
                            className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Rocket className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-2">CREATE ROOM</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Start a private battle arena
                                </p>
                                <button
                                    onClick={createRoom}
                                    className="btn-primary w-full py-4 text-lg font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <Sparkles size={20} />
                                    CREATE ARENA
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            <div className="relative text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Swords className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-black mb-2">JOIN ROOM</h3>
                                <input
                                    type="text"
                                    placeholder="ENTER CODE"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="input-field mb-4 text-center text-2xl font-black uppercase tracking-widest"
                                    maxLength={6}
                                />
                                <button
                                    onClick={joinRoom}
                                    disabled={roomCode.length !== 6}
                                    className="btn-primary w-full py-4 text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 transition-transform"
                                >
                                    <Target size={20} />
                                    JOIN BATTLE
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* WAITING ROOM */}
            {gameState === 'waiting' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto px-4 py-8"
                >
                    <div className="card p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        <div className="text-center mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="inline-block text-6xl mb-4"
                            >
                                ⚔️
                            </motion.div>
                            <h2 className="text-4xl font-black mb-2">BATTLE LOBBY</h2>
                            <p className="text-gray-600 dark:text-gray-400">Gathering warriors...</p>
                        </div>

                        {/* Room Code Display */}
                        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                            <div className="relative text-center">
                                <p className="text-white/80 text-sm mb-2 font-bold uppercase tracking-wider">Room Code</p>
                                <div className="flex items-center justify-center gap-4">
                                    <code className="text-5xl font-black tracking-wider text-white drop-shadow-lg">
                                        {roomCode}
                                    </code>
                                    <motion.button 
                                        onClick={copyCode} 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
                                    >
                                        <Copy size={24} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Players Grid */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-xl font-bold flex items-center gap-2">
                                    <Users className="text-blue-500" size={24} />
                                    Warriors Ready: {players.length}/8
                                </p>
                                <div className="flex gap-1">
                                    {[...Array(8)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`w-3 h-3 rounded-full ${
                                                i < players.length ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {players.map((player, idx) => (
                                    <motion.div 
                                        key={player.id}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative"
                                    >
                                        <div className={`p-4 rounded-2xl text-center relative overflow-hidden ${
                                            player.isYou 
                                                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg ring-4 ring-blue-400' 
                                                : 'bg-white dark:bg-gray-800 shadow-md'
                                        }`}>
                                            {player.isYou && (
                                                <div className="absolute top-2 right-2">
                                                    <Crown className="text-yellow-300" size={20} />
                                                </div>
                                            )}
                                            <div className="text-5xl mb-2">{player.avatar}</div>
                                            <div className="font-black text-sm truncate">{player.name}</div>
                                            {player.isYou && <div className="text-xs opacity-90 mt-1">YOU</div>}
                                        </div>
                                    </motion.div>
                                ))}
                                
                                {/* Empty slots */}
                                {[...Array(Math.max(0, 8 - players.length))].map((_, i) => (
                                    <div 
                                        key={`empty-${i}`} 
                                        className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center border-2 border-dashed border-gray-300 dark:border-gray-700"
                                    >
                                        <div className="text-4xl opacity-30 mb-2">👤</div>
                                        <div className="text-xs text-gray-400">Waiting...</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Start Button */}
                        {isHost && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <button
                                    onClick={startGame}
                                    disabled={players.length < 2}
                                    className="w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3"
                                >
                                    <Rocket size={32} />
                                    START BATTLE
                                    <Rocket size={32} />
                                </button>
                                {players.length < 2 && (
                                    <p className="text-orange-600 dark:text-orange-400 mt-4 text-center font-bold flex items-center justify-center gap-2">
                                        ⚠️ Need at least 2 warriors to begin!
                                    </p>
                                )}
                            </motion.div>
                        )}
                        
                        {!isHost && (
                            <div className="text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-6xl mb-4"
                                >
                                    ⏳
                                </motion.div>
                                <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                    Waiting for host to start the battle...
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* PLAYING VIEW - Continue with existing game UI but with enhanced visuals... */}
                       {/* PLAYING VIEW */}
            {gameState === 'playing' && currentQ && (
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Quiz Area */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* XP and Level Bar */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="card p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                                            {level}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-600 dark:text-gray-400">LEVEL {level}</div>
                                            <div className="text-sm font-black">{xp} / {level * 100} XP</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-gray-600 dark:text-gray-400">TOTAL XP</div>
                                        <div className="text-sm font-black">{totalXP}</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpPercentage}%` }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                                    />
                                </div>
                            </motion.div>

                            {/* Progress and Stats */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="card p-5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-black text-gray-600 dark:text-gray-400">
                                            QUESTION {currentQuestion + 1}/{QUIZ_QUESTIONS.length}
                                        </div>
                                        <div className="flex gap-1">
                                            {QUIZ_QUESTIONS.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-8 h-2 rounded-full transition-all ${
                                                        idx < currentQuestion ? 'bg-green-500' :
                                                        idx === currentQuestion ? 'bg-blue-500 animate-pulse' :
                                                        'bg-gray-300 dark:bg-gray-700'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lives */}
                                    <div className="flex items-center gap-2">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={i < lives ? { scale: [1, 1.2, 1] } : {}}
                                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                            >
                                                <Heart
                                                    size={24}
                                                    className={i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Score Display */}
                                <div className="grid grid-cols-3 gap-4">
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white text-center shadow-lg"
                                    >
                                        <div className="text-3xl font-black mb-1">{score}</div>
                                        <div className="text-xs opacity-90 font-bold uppercase">Score</div>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white text-center shadow-lg"
                                    >
                                        <div className="text-3xl font-black flex items-center justify-center gap-2">
                                            <Flame size={20} />
                                            {streak}
                                        </div>
                                        <div className="text-xs opacity-90 font-bold uppercase">Streak</div>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white text-center shadow-lg"
                                    >
                                        <div className="text-3xl font-black">{combo}x</div>
                                        <div className="text-xs opacity-90 font-bold uppercase">Combo</div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Timer */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="card p-5"
                            >
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                animate={timeLeft <= 5 ? { 
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, -10, 10, 0]
                                                } : {}}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            >
                                                <Timer className={timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'} size={32} />
                                            </motion.div>
                                            <span className={`text-4xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
                                                {timeLeft}s
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-black text-sm shadow-lg">
                                            <Star size={16} />
                                            +{currentQ.points} PTS
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${(timeLeft / currentQ.timeLimit) * 100}%` }}
                                            className={`h-full rounded-full ${
                                                timeLeft <= 5 
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Question Card */}
                            <motion.div
                                key={currentQuestion}
                                initial={{ x: 100, opacity: 0, scale: 0.9 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                className="card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                                        currentQ.difficulty === 'easy' ? 'bg-green-500 text-white' :
                                        currentQ.difficulty === 'medium' ? 'bg-yellow-500 text-white' :
                                        'bg-red-500 text-white'
                                    }`}>
                                        {currentQ.difficulty}
                                    </span>
                                    <Brain className="text-purple-500" size={24} />
                                </div>

                                <h2 className="text-2xl font-bold mb-6 text-center leading-tight">
                                    {currentQ.question}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQ.options.map((option, idx) => {
                                        const isSelected = selectedAnswer === idx;
                                        const isCorrect = idx === currentQ.correct;
                                        const shouldShowResult = selectedAnswer !== null;

                                        const shouldHide = usedPowerUp === 'fiftyFifty' && 
                                            !isCorrect && 
                                            idx !== currentQ.correct && 
                                            Math.random() > 0.5;

                                        if (shouldHide) return null;

                                        return (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: selectedAnswer === null ? 1.03 : 1 }}
                                                whileTap={{ scale: selectedAnswer === null ? 0.97 : 1 }}
                                                onClick={() => handleAnswer(idx)}
                                                disabled={selectedAnswer !== null}
                                                className={`
                                                    p-5 rounded-xl text-base font-bold transition-all relative overflow-hidden
                                                    ${!shouldShowResult ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 shadow-md hover:shadow-lg' : ''}
                                                    ${shouldShowResult && isSelected && isCorrect ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-600 shadow-2xl scale-105' : ''}
                                                    ${shouldShowResult && isSelected && !isCorrect ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white border-4 border-red-600 shadow-xl' : ''}
                                                    ${shouldShowResult && !isSelected && isCorrect ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-4 border-green-600 shadow-xl' : ''}
                                                    ${shouldShowResult && !isSelected && !isCorrect ? 'opacity-50 scale-95' : ''}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0
                                                        ${!shouldShowResult ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' : ''}
                                                        ${shouldShowResult && (isSelected || isCorrect) ? 'bg-white/30 text-white' : ''}
                                                    `}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-left flex-1">{option}</span>
                                                    {shouldShowResult && isCorrect && (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                        >
                                                            <CheckCircle className="flex-shrink-0" size={24} />
                                                        </motion.div>
                                                    )}
                                                    {shouldShowResult && isSelected && !isCorrect && (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: 180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                        >
                                                            <XCircle className="flex-shrink-0" size={24} />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Power-Ups */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="card p-5"
                            >
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                    <Zap className="text-yellow-500" size={24} />
                                    POWER-UPS
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <motion.button
                                        onClick={useFiftyFifty}
                                        disabled={powerUps.fiftyFifty === 0 || selectedAnswer !== null}
                                        whileHover={{ scale: powerUps.fiftyFifty > 0 && !selectedAnswer ? 1.05 : 1 }}
                                        whileTap={{ scale: powerUps.fiftyFifty > 0 && !selectedAnswer ? 0.95 : 1 }}
                                        className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <div className="text-3xl mb-2">🎯</div>
                                        <div className="text-sm font-black">50/50</div>
                                        <div className="text-xs opacity-80 mt-1">{powerUps.fiftyFifty} LEFT</div>
                                    </motion.button>
                                    
                                    <motion.button
                                        onClick={useTimeFreeze}
                                        disabled={powerUps.timeFreeze === 0 || selectedAnswer !== null}
                                        whileHover={{ scale: powerUps.timeFreeze > 0 && !selectedAnswer ? 1.05 : 1 }}
                                        whileTap={{ scale: powerUps.timeFreeze > 0 && !selectedAnswer ? 0.95 : 1 }}
                                        className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <div className="text-3xl mb-2">⏱️</div>
                                        <div className="text-sm font-black">+10s</div>
                                        <div className="text-xs opacity-80 mt-1">{powerUps.timeFreeze} LEFT</div>
                                    </motion.button>
                                    
                                    <motion.button
                                        onClick={useShield}
                                        disabled={powerUps.shield === 0}
                                        whileHover={{ scale: powerUps.shield > 0 ? 1.05 : 1 }}
                                        whileTap={{ scale: powerUps.shield > 0 ? 0.95 : 1 }}
                                        className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <div className="text-3xl mb-2">🛡️</div>
                                        <div className="text-sm font-black">SHIELD</div>
                                        <div className="text-xs opacity-80 mt-1">{powerUps.shield} LEFT</div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Live Leaderboard */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="card sticky top-4 p-5"
                            >
                                <h3 className="text-xl font-black mb-5 flex items-center gap-2">
                                    <Trophy className="text-yellow-500" size={26} />
                                    LIVE RANKINGS
                                    <span className="ml-auto px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse font-black">
                                        LIVE
                                    </span>
                                </h3>

                                <div className="space-y-3">
                                    {sortedPlayers.map((player, idx) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`
                                                p-4 rounded-xl transition-all
                                                ${player.isYou ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105 ring-4 ring-blue-400' : 'bg-gray-100 dark:bg-gray-800'}
                                                ${idx === 0 ? 'ring-4 ring-yellow-400' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0
                                                    ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                      idx === 1 ? 'bg-gray-400 text-gray-900' :
                                                      idx === 2 ? 'bg-orange-400 text-orange-900' :
                                                      'bg-gray-600 text-white'}
                                                `}>
                                                    {idx === 0 ? '👑' : idx + 1}
                                                </div>

                                                <div className="text-3xl">{player.avatar}</div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-sm truncate">{player.name}</div>
                                                    {player.streak > 0 && (
                                                        <div className="flex items-center gap-1 text-xs opacity-80">
                                                            <Flame size={12} />
                                                            {player.streak}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-2xl font-black">
                                                    {player.score}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Your Stats */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                                    <div className="text-xs font-black text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                                        Your Performance
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div>
                                            <div className="text-2xl font-black text-green-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={20} />
                                                {answeredQuestions.filter(q => q.correct).length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">CORRECT</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-red-600 flex items-center justify-center gap-1">
                                                <XCircle size={20} />
                                                {answeredQuestions.filter(q => !q.correct).length}
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 font-bold">WRONG</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements Preview */}
                                {achievements.length > 0 && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl">
                                        <div className="text-xs font-black text-gray-600 dark:text-gray-400 mb-2">ACHIEVEMENTS</div>
                                        <div className="flex flex-wrap gap-2">
                                            {achievements.slice(0, 6).map(achId => {
                                                const ach = ACHIEVEMENTS.find(a => a.id === achId);
                                                return ach ? (
                                                    <div key={achId} className="text-2xl" title={ach.name}>
                                                        {ach.icon}
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}

            {/* RESULTS VIEW */}
            {gameState === 'results' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto px-4 py-8"
                >
                    <div className="card p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        {/* Victory/Defeat Banner */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', duration: 0.8 }}
                            className="mb-8 text-center"
                        >
                            {sortedPlayers.findIndex(p => p.isYou) === 0 ? (
                                <>
                                    <motion.div 
                                        className="text-9xl mb-4"
                                        animate={{ 
                                            rotate: [0, -10, 10, -10, 10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        🏆
                                    </motion.div>
                                    <h2 className="text-6xl font-black mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                        CHAMPION!
                                    </h2>
                                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                        You dominated the arena!
                                    </p>
                                </>
                            ) : sortedPlayers.findIndex(p => p.isYou) < 3 ? (
                                <>
                                    <div className="text-9xl mb-4">
                                        {sortedPlayers.findIndex(p => p.isYou) === 1 ? '🥈' : '🥉'}
                                    </div>
                                    <h2 className="text-5xl font-black mb-3 gradient-text">PODIUM FINISH!</h2>
                                    <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                        Great performance!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-9xl mb-4">💪</div>
                                    <h2 className="text-5xl font-black mb-3 gradient-text">GOOD BATTLE!</h2>
                                    <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                        Keep training to improve!
                                    </p>
                                </>
                            )}
                        </motion.div>

                        {/* Final Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white text-center shadow-lg"
                            >
                                <div className="text-4xl font-black mb-2">{score}</div>
                                <div className="text-xs opacity-90 font-bold uppercase">Final Score</div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white text-center shadow-lg"
                            >
                                <div className="text-4xl font-black mb-2">
                                    {answeredQuestions.filter(q => q.correct).length}/{QUIZ_QUESTIONS.length}
                                </div>
                                <div className="text-xs opacity-90 font-bold uppercase">Accuracy</div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white text-center shadow-lg"
                            >
                                <div className="text-4xl font-black mb-2">
                                    #{sortedPlayers.findIndex(p => p.isYou) + 1}
                                </div>
                                <div className="text-xs opacity-90 font-bold uppercase">Rank</div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="p-5 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl text-white text-center shadow-lg"
                            >
                                <div className="text-4xl font-black mb-2 flex items-center justify-center gap-1">
                                    <Trophy size={24} />
                                    {totalXP}
                                </div>
                                <div className="text-xs opacity-90 font-bold uppercase">Total XP</div>
                            </motion.div>
                        </div>

                        {/* Final Leaderboard */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-black mb-5 flex items-center gap-2">
                                <Medal className="text-yellow-500" size={28} />
                                FINAL STANDINGS
                            </h3>
                            <div className="space-y-3">
                                {sortedPlayers.map((player, idx) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 + idx * 0.1 }}
                                        className={`
                                            p-5 rounded-2xl flex items-center gap-4
                                            ${player.isYou ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-gray-800 shadow-md'}
                                            ${idx === 0 ? 'ring-4 ring-yellow-400' : ''}
                                        `}
                                    >
                                        <div className={`
                                            w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0
                                            ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                              idx === 1 ? 'bg-gray-400 text-gray-900' :
                                              idx === 2 ? 'bg-orange-400 text-orange-900' :
                                              'bg-gray-600 text-white'}
                                        `}>
                                            {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                        </div>

                                        <div className="text-4xl">{player.avatar}</div>

                                        <div className="flex-1">
                                            <div className="font-black text-lg">{player.name}</div>
                                            {player.isYou && (
                                                <div className="text-sm opacity-90 font-bold">YOU</div>
                                            )}
                                        </div>

                                        <div className="text-3xl font-black">
                                            {player.score}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements Earned */}
                        {achievements.length > 0 && (
                            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl">
                                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                                    <Award className="text-yellow-600" size={24} />
                                    ACHIEVEMENTS EARNED
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {achievements.map(achId => {
                                        const ach = ACHIEVEMENTS.find(a => a.id === achId);
                                        return ach ? (
                                            <div key={achId} className="p-4 bg-white dark:bg-gray-800 rounded-xl text-center shadow-md">
                                                <div className="text-4xl mb-2">{ach.icon}</div>
                                                <div className="font-bold text-sm">{ach.name}</div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{ach.desc}</div>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setGameState('lobby');
                                    setRoomCode('');
                                    setScore(0);
                                    setStreak(0);
                                    setCombo(1);
                                    setAnsweredQuestions([]);
                                    setLives(3);
                                    setPowerUps({ fiftyFifty: 1, timeFreeze: 1, shield: 1 });
                                    setPlayers([]);
                                    setIsHost(false);
                                }}
                                className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Rocket size={24} />
                                PLAY AGAIN
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/')}
                                className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700"
                            >
                                🏠 BACK HOME
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}


// Add this to your global CSS for the shake animation
const styles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

.animate-shake {
  animation: shake 0.5s;
}
`;

export default Playground;