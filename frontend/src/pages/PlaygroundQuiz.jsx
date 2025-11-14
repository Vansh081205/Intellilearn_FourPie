import {useParams, useNavigate} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import Quiz from '../components/features/Quiz';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useUser} from '@clerk/clerk-react';
import {io} from 'socket.io-client';
import {API_BASE_URL} from '../config';
import {Users, Copy, Zap, Wifi, WifiOff} from 'lucide-react';

const AVATARS = ['🎯', '👨‍💻', '👩‍🎓', '👨‍🎨', '👩‍💼', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️'];

export default function PlaygroundQuiz() {
    const {quizId} = useParams();
    const navigate = useNavigate();
    const {user} = useUser();
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gameMode, setGameMode] = useState('lobby'); // 'lobby', 'singleplayer', 'multiplayerLobby', 'multiplayerGame'
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [inputRoomCode, setInputRoomCode] = useState('');

    const socketRef = useRef(null);
    const userId = user?.id || 'guest_' + Math.random().toString(36).substring(7);

    useEffect(() => {
        if (user) {
            setPlayerName(user.firstName || user.username || 'Player');
        }
    }, [user]);

    useEffect(() => {
        if (quizId) {
            fetchQuiz();
        }
    }, [quizId]);

    // Initialize Socket.IO
    useEffect(() => {
        const SOCKET_URL = API_BASE_URL.replace('/api', '');

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
        });

      const socket = socketRef.current;

      socket.on('connect', () => {
          setIsConnected(true);
          toast.success('Connected to server! 🎮', {icon: '✅'});
      });

      socket.on('connect_error', (error) => {
          setIsConnected(false);
          toast.error(`Connection failed: ${error.message}`, {icon: '❌'});
      });

      socket.on('disconnect', () => {
          setIsConnected(false);
      });

      socket.on('room_created', (data) => {
          setRoomCode(data.room_code);
          setGameMode('multiplayerLobby');
          setIsHost(true);

          // Update quiz data if provided by backend
          if (data.quiz_data) {
              setQuizData(data.quiz_data);
              console.log('✅ Quiz data received for host:', data.quiz_data);
          }

          toast.success(`Room created! Code: ${data.room_code}`, {icon: '🎮'});
      });

        socket.on('quiz_data_received', (data) => {
            // Joining players receive quiz data here
            if (data.quiz_data) {
                setQuizData(data.quiz_data);
                console.log('✅ Quiz data received for joining player:', data.quiz_data);
                toast.success('Quiz loaded! 📚', {icon: '✅'});
            }
        });

        socket.on('player_joined', (data) => {
          toast.success(`${data.username} joined!`, {icon: '👋'});
      });

      socket.on('update_room', (roomData) => {
          if (roomData && roomData.players) {
              const updatedPlayers = roomData.players.map((p, idx) => ({
                  id: p.sid || idx,
                  name: p.name || p.username,
                  avatar: p.avatar || AVATARS[idx % AVATARS.length],
                  isYou: (p.name || p.username) === playerName
              }));
              setPlayers(updatedPlayers);
          }
      });

      socket.on('game_started', () => {
          setGameMode('multiplayerGame');
          toast.success('Game Started! Good luck! 🎮', {icon: '🚀'});
      });

        socket.on('question_next', (data) => {
            console.log('⏭️ Moving to next question:', data.questionIndex);
            // This will be handled by the Quiz component
        });

        socket.on('error', (data) => {
          toast.error(data.message, {icon: '⚠️'});
      });

      return () => {
          socket.disconnect();
    };
  }, [playerName]);

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/playground/${quizId}`);
            setQuizData(response.data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Quiz not found or unavailable');
            navigate('/');
        } finally {
            setLoading(false);
    }
  };

    const handleCreateRoom = () => {
        if (!socketRef.current?.connected) {
            toast.error('Not connected to server!', {icon: '❌'});
            return;
    }

      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      socketRef.current.emit('create_room', {
          quiz_id: quizId,
          username: playerName,
          avatar: avatar
      });
  };

    const handleJoinRoom = () => {
        if (!socketRef.current?.connected) {
            toast.error('Not connected to server!', {icon: '❌'});
            return;
        }

        if (inputRoomCode.length !== 6) {
            toast.error('Please enter a valid 6-character room code', {icon: '⚠️'});
            return;
        }

        const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        socketRef.current.emit('join_room', {
            room_code: inputRoomCode.toUpperCase(),
            username: playerName,
            avatar: avatar
        });

        setRoomCode(inputRoomCode.toUpperCase());
        setGameMode('multiplayerLobby');
    };

    const handleStartGame = () => {
        if (!socketRef.current?.connected) {
            toast.error('Not connected to server!', {icon: '❌'});
            return;
        }

        if (players.length < 2) {
            toast.error('Need at least 2 players to start!', {icon: '⚠️'});
            return;
        }

        socketRef.current.emit('start_game', {room_code: roomCode});
    };

    const handleStartSingleplayer = () => {
        setGameMode('singleplayer');
    };

    const handleComplete = () => {
        toast.success('Quiz completed!');
        navigate('/student/dashboard');
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        toast.success('Code copied! 📋');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">🧠</div>
                    <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quizData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold mb-2">Quiz not found</h2>
                    <button onClick={() => navigate('/')} className="btn-primary mt-4">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Show mode selection
    if (gameMode === 'lobby') {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
                {/* Connection Status */}
                <div className="fixed top-4 right-4 z-50">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${
                        isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'
                    }`}>
                        {isConnected ? <Wifi size={20}/> : <WifiOff size={20}/>}
                        <span className="font-semibold text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        className="text-center mb-12"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{duration: 2, repeat: Infinity}}
                            className="inline-block w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
                        >
                            <span className="text-4xl">🎮</span>
                        </motion.div>

                        <h1 className="text-5xl font-black mb-4">
              <span
                  className="gradient-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quiz Playground
              </span>
            </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-semibold">
                  Choose your battle mode
              </p>
          </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Single Player Mode */}
                <motion.div
                    initial={{opacity: 0, x: -50}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.2}}
                    whileHover={{scale: 1.02, y: -5}}
                    className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 cursor-pointer border-2 border-blue-200 dark:border-blue-700 hover:border-blue-500 transition-all"
                    onClick={handleStartSingleplayer}
                >
                    <div className="text-center">
                        <div
                            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <span className="text-4xl">🎯</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Solo Practice</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Test your knowledge at your own pace.
                        </p>
                        <div className="space-y-2 text-sm text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                <span>Detailed explanations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                <span>Track your progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-500">✓</span>
                                <span>Earn points</span>
                            </div>
                        </div>
                        <button className="btn-primary w-full mt-6 py-3">
                            Start Solo Quiz
                        </button>
                    </div>
                </motion.div>

              {/* Multiplayer Mode */}
              <motion.div
                  initial={{opacity: 0, x: 50}}
                  animate={{opacity: 1, x: 0}}
                  transition={{delay: 0.3}}
                  className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 border-2 border-purple-200 dark:border-purple-700"
              >
                  <div className="text-center">
                      <div
                          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <span className="text-4xl">⚔️</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Multiplayer Battle</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Compete with friends in real-time!
                      </p>
                      <div className="space-y-2 text-sm text-left mb-6">
                          <div className="flex items-center gap-2">
                              <span className="text-purple-500">★</span>
                              <span>Real-time leaderboard</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-purple-500">★</span>
                              <span>Power-ups & bonuses</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className="text-purple-500">★</span>
                              <span>Lives & combo system</span>
                          </div>
                      </div>

                      {/* Lobby Controls */}
                      <div className="space-y-3">
                          <input
                              type="text"
                              value={playerName}
                              onChange={(e) => setPlayerName(e.target.value)}
                              className="input-field text-center font-bold"
                              placeholder="Your name"
                          />

                          <button
                              onClick={handleCreateRoom}
                              className="btn-primary w-full py-3"
                              disabled={!isConnected}
                          >
                              <Zap className="inline mr-2" size={18}/>
                              Create Room
                          </button>

                          <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                      <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-purple-50 dark:bg-gray-800 text-gray-500">OR</span>
                      </div>
                  </div>

                    <input
                        type="text"
                        value={inputRoomCode}
                        onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                        className="input-field text-center text-lg font-bold uppercase"
                        placeholder="ROOM CODE"
                        maxLength={6}
                    />

                    <button
                        onClick={handleJoinRoom}
                        className="btn-primary w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600"
                        disabled={!isConnected || inputRoomCode.length !== 6}
                    >
                        <Users className="inline mr-2" size={18}/>
                        Join Room
                    </button>
                </div>
              </div>
            </motion.div>
          </div>

            {/* Quiz Info */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.4}}
                className="mt-12 text-center"
            >
                <div className="card inline-block px-8 py-4">
                    <div className="flex items-center gap-6 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                            <span className="ml-2 font-bold">{quizData.questions?.length || 0}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                            <span className={`ml-2 font-bold ${
                                quizData.difficulty === 'easy' ? 'text-green-600' :
                                    quizData.difficulty === 'medium' ? 'text-yellow-600' :
                                        'text-red-600'
                            }`}>
                    {quizData.difficulty?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

    // Multiplayer Lobby (Waiting Room)
    if (gameMode === 'multiplayerLobby') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        className="card text-center p-8"
                    >
                        <h2 className="text-3xl font-bold mb-6">Waiting Room</h2>

                        <div
                            className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-8">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Room Code</p>
                            <div className="flex items-center justify-center gap-4">
                                <code className="text-4xl font-black tracking-wider">{roomCode}</code>
                                <button onClick={copyCode}
                                        className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                    <Copy size={20}/>
                                </button>
                            </div>
            </div>

              <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
                  Players in lobby: <span className="font-bold text-blue-600">{players.length}</span>/8
              </p>

              <div className="grid grid-cols-4 gap-4 mb-8">
                  {players.map(player => (
                      <div key={player.id} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                          <div className="text-4xl mb-2">{player.avatar}</div>
                          <div className="font-semibold text-sm truncate">{player.name}</div>
                          {player.isYou && <div className="text-xs text-blue-500 mt-1">You</div>}
                </div>
              ))}
            </div>

              {isHost ? (
                  <>
                      <button
                          onClick={handleStartGame}
                          disabled={players.length < 2}
                          className="btn-primary py-4 px-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          🚀 Start Game
                      </button>
                      {players.length < 2 && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 mt-4">
                              ⚠️ Need at least 2 players to start
                          </p>
                      )}
                  </>
              ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                      Waiting for host to start the game...
                  </p>
              )}
          </motion.div>
        </div>
      </div>
    );
  }

    // Singleplayer Quiz
    if (gameMode === 'singleplayer') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <Quiz
                        quizData={quizData}
                        quizId={quizId}
                        userId={userId}
                        onComplete={handleComplete}
                        isMultiplayer={false}
                    />
                </div>
            </div>
        );
    }

    // Multiplayer Quiz
    if (gameMode === 'multiplayerGame') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <Quiz
                        quizData={quizData}
                        quizId={quizId}
                        userId={userId}
                        onComplete={handleComplete}
                        isMultiplayer={true}
                        roomCode={roomCode}
                        playerName={playerName}
                        isHost={isHost}
                    />
                </div>
            </div>
        );
    }

    return null;
}
