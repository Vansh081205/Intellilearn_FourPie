import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  Volume2, 
  Brain, 
  Lightbulb,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

function Summary({ docData, onGenerateQuiz }) {
  const [loading, setLoading] = useState(false);
  const [showELI5, setShowELI5] = useState(false);
  const [eli5Text, setEli5Text] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  const handleGenerateQuiz = async () => {
    setShowDifficultyModal(true);
  };

  const confirmGenerateQuiz = async () => {
    setShowDifficultyModal(false);
    setLoading(true);
    const loadingToast = toast.loading('🧠 AI is generating your adaptive quiz...');
    
    try {
      const response = await axios.post('http://localhost:5000/api/generate-quiz', {
        doc_id: docData.doc_id,
        user_id: 'demo_user',
        difficulty: selectedDifficulty
      });
      
      toast.success('✨ Quiz generated successfully!', { id: loadingToast });
      onGenerateQuiz(response.data);
    } catch (error) {
      toast.error('Failed to generate quiz', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleELI5 = async () => {
    if (eli5Text) {
      setShowELI5(!showELI5);
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('🧒 Simplifying for you...');
    
    try {
      const response = await axios.post('http://localhost:5000/api/eli5', {
        doc_id: docData.doc_id
      });
      
      setEli5Text(response.data.explanation);
      setShowELI5(true);
      toast.success('Here\'s the simple version!', { id: loadingToast });
    } catch (error) {
      toast.error('ELI5 generation failed', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const text = activeTab === 'eli5' ? eli5Text : docData.summary;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success('🎧 Audio started');
    } else {
      toast.error('Text-to-speech not supported in your browser');
    }
  };

  const handleCopy = () => {
    const text = activeTab === 'eli5' ? eli5Text : docData.summary;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('📋 Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyOptions = [
    { 
      value: 'easy', 
      label: 'Easy', 
      emoji: '🌱', 
      desc: 'Simple questions, perfect for beginners',
      color: 'green',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      emoji: '🎯', 
      desc: 'Balanced difficulty for steady learning',
      color: 'blue',
      gradient: 'from-yellow-500 to-orange-600'
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      emoji: '🚀', 
      desc: 'Advanced questions to challenge yourself',
      color: 'purple',
      gradient: 'from-red-500 to-pink-600'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI-Generated Summary</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {docData.filename}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleELI5}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Lightbulb size={18} />
              <span className="hidden sm:inline">ELI5 Mode</span>
            </motion.button>

            <motion.button
              onClick={handleSpeak}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
                isSpeaking 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Volume2 size={18} className={isSpeaking ? 'animate-pulse' : ''} />
              <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </motion.button>

            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-gray-700 shadow-md'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            📚 Summary
          </button>
          <button
            onClick={() => {
              setActiveTab('eli5');
              if (!eli5Text) handleELI5();
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'eli5'
                ? 'bg-white dark:bg-gray-700 shadow-md'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            🧒 ELI5
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'summary' ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-inner">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {docData.summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {eli5Text ? (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-inner">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">🎈</div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                          Explained in Simple Terms
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Perfect for quick understanding
                        </p>
                      </div>
                    </div>
                    <div className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                      {eli5Text}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin text-6xl mb-4">⚡</div>
                    <p className="text-gray-500">Loading simplified version...</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {docData.summary.split(' ').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ~{Math.ceil(docData.summary.split(' ').length / 200)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Min Read</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">AI</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Powered</div>
          </div>
        </div>

        {/* Generate Quiz Button */}
        <motion.button
          onClick={handleGenerateQuiz}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full mt-8 py-4 text-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="animate-spin">⚡</div>
              <span>Generating Adaptive Quiz...</span>
            </>
          ) : (
            <>
              <Brain size={24} />
              <span>Generate Smart Quiz</span>
              <Sparkles size={20} />
            </>
          )}
        </motion.button>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border-l-4 border-yellow-500"
        >
          <div className="flex items-start gap-3">
            <Zap className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                Adaptive Learning Active
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Choose your difficulty level, and the AI will continue to adapt based on your performance!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Difficulty Selection Modal */}
      <AnimatePresence>
        {showDifficultyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDifficultyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold mb-2">Choose Quiz Difficulty</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select the difficulty level that best matches your current knowledge
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDifficulty(option.value)}
                    className={`p-6 rounded-2xl border-3 transition-all duration-300 text-center
                      ${selectedDifficulty === option.value
                        ? `border-${option.color}-500 bg-gradient-to-br ${option.gradient} text-white shadow-xl scale-105`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                  >
                    <div className="text-5xl mb-3">{option.emoji}</div>
                    <div className={`text-xl font-bold mb-2 ${
                      selectedDifficulty === option.value ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {option.label}
                    </div>
                    <div className={`text-sm ${
                      selectedDifficulty === option.value ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border-l-4 border-blue-500 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      AI Adaptive Learning
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This is your starting difficulty. The AI will automatically adjust future quizzes based on your performance!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDifficultyModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmGenerateQuiz}
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                >
                  <Brain size={20} />
                  <span>Generate Quiz</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Summary;