import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react'; // ✅ ADD THIS IMPORT

function DocumentUpload({ onUploadSuccess }) {
  const { user, isLoaded } = useUser(); // ✅ GET USER FROM CLERK
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(`File selected: ${e.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    // ✅ ADD USER AUTHENTICATION CHECK
    if (!isLoaded) {
      toast.error('Loading user session...');
      return;
    }

    if (!user) {
      toast.error('Please sign in to upload documents');
      return;
    }

    if (!file) {
      toast.error('Please select a file first!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('user_id', user.id); // ✅ ADD USER ID FROM CLERK
    formData.append('username', user.fullName || user.firstName || 'User'); // ✅ OPTIONAL: ADD USERNAME

    const loadingToast = toast.loading('🤖 AI is processing your document...');

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('✨ Document processed successfully!', { id: loadingToast });
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + (error.response?.data?.error || error.message), { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', emoji: '🌱', desc: 'Simple concepts', color: 'green' },
    { value: 'medium', label: 'Medium', emoji: '🎯', desc: 'Balanced approach', color: 'blue' },
    { value: 'hard', label: 'Hard', emoji: '🚀', desc: 'Advanced content', color: 'purple' }
  ];

  // ✅ OPTIONAL: SHOW LOADING STATE WHILE CLERK IS INITIALIZING
  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ OPTIONAL: SHOW MESSAGE IF USER IS NOT SIGNED IN
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to upload and process documents
          </p>
          <button className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Upload className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Upload Study Material</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your documents and let AI create personalized learning content
          </p>
        </div>

        {/* File Upload Area */}
        <div 
          className={`relative border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer mb-6
            ${file 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={64} />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">Drop your file here</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supports: PDF, TXT (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <CheckCircle className="text-green-500" size={48} />
              <div className="text-left">
                <p className="font-semibold text-lg">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-4">
            Select Learning Difficulty
          </label>
          <div className="grid grid-cols-3 gap-4">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDifficulty(option.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${difficulty === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                <div className="font-semibold mb-1">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {option.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={24} />
              <span>Processing with AI...</span>
            </>
          ) : (
            <>
              <Upload size={24} />
              <span>Generate AI Summary & Quiz</span>
            </>
          )}
        </button>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '⚡', title: 'Instant AI', desc: 'Process in seconds' },
            { icon: '🎯', title: 'Adaptive', desc: 'Learns your style' },
            { icon: '🔒', title: 'Secure', desc: 'Your data is safe' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default DocumentUpload;