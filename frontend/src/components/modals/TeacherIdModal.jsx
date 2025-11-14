import { motion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function TeacherIdModal({ teacherId, onClose }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(teacherId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          {/* Animated emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            👨‍🏫
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
          >
            Welcome, Teacher!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 mb-6"
          >
            Your unique Teacher ID has been generated
          </motion.p>
          
          {/* Teacher ID Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl mb-6 border-2 border-purple-200 dark:border-purple-800"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Your Teacher ID
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {teacherId}
            </p>
          </motion.div>
          
          {/* Copy Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all group"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                <span className="text-gray-700 dark:text-gray-200 font-medium">Copy Teacher ID</span>
              </>
            )}
          </motion.button>
          
          {/* Important Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Important:</strong> Save this ID! You'll need it along with your email to sign in.
            </p>
          </motion.div>
          
          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Continue to Dashboard →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
