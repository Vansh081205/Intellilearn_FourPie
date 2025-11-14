import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, Home } from 'lucide-react';
import Quiz from '../components/features/Quiz';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/playground/${quizId}`);
      setQuizData(response.data);
    } catch (error) {
      toast.error('Quiz not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    toast.success('Quiz completed!');
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700"
        >
          <motion.div 
            className="flex justify-center mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading quiz...</p>
          <div className="mt-4 flex gap-2 justify-center">
            <motion.div 
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 max-w-md"
        >
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Quiz not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The quiz you're looking for doesn't exist or has been removed.
          </p>
          <motion.button 
            onClick={() => navigate('/')} 
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all inline-flex items-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Quiz 
            quizData={quizData} 
            quizId={quizId}
            userId="demo_user"
            onComplete={handleComplete}
          />
        </motion.div>
      </div>
    </div>
  );
}