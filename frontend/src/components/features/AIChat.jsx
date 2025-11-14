import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  Loader,
  User,
  Bot,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

function AIChatbot({ selectedDocument = null, isEmbedded = false }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  // CORRECT INPUT STATE DECLARATION
  const [input, setInput] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: selectedDocument
            ? `Hi! I'm your AI study assistant powered by Google Gemini. I can help you understand "${selectedDocument.filename}" better. Ask me anything about the document!`
            : "Hi! I'm your AI study assistant powered by Google Gemini. Upload a document and I'll help you learn from it!",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [selectedDocument]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Auto-resize textarea - FIXED
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = 
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]); // Dependency on 'input' state is correct

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ FIX APPLIED HERE for input clearing and conversation history in API payload
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input.trim();
    
    // Create user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString(),
    };

    // 1. Add user message
    setMessages((prev) => [...prev, userMessage]);
    
    // 💥 REMOVED: setInput('') was here. Moving it to finally block ensures
    // the text isn't cleared until the processing (loading) is done.

    setLoading(true);
    setTyping(true);

    // 2. Reset textarea height (Visual Fix)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Prepare conversation history: messages is stale, so manually add userMessage
    const historyForApi = [
        ...messages.slice(-6).map(msg => ({ 
            role: msg.role, 
            content: msg.content 
        })), 
        { role: userMessage.role, content: userMessage.content }
    ];

    try {
      console.log('Sending request to backend...'); // Debug log
      
      const response = await axios.post(
        'http://localhost:5000/api/chat/gemini',
        {
          message: currentInput,
          userId: user?.id || 'demo',
          documentSummary: selectedDocument?.summary || null,
          documentTitle: selectedDocument?.filename || null,
          conversationHistory: historyForApi, // ✅ Use the constructed, up-to-date history
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('Backend response:', response.data); // Debug log

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response || response.data.message || 'No response received',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setTyping(false);
      
    } catch (error) {
      console.error('Full error details:', error); // Enhanced error logging
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = "I'm sorry, I encountered an error. Please try again.";
      
      // More specific error messages
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out. Please try again.";
        toast.error('Request timed out');
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = "Cannot connect to server. Please check if the backend is running or the URL is correct.";
        toast.error('Backend server not reachable');
      } else if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
        toast.error('Rate limit exceeded');
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
        toast.error('Server error');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to get response');
      }

      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMsg]);
      setTyping(false);
    } finally {
      setLoading(false);
      // ✅ FIX: Clear input here, after loading is set to false
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: selectedDocument
            ? `Chat cleared! How can I help you with "${selectedDocument.filename}"?`
            : 'Chat cleared! How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.success('Chat history cleared');
      
      // Ensure input is cleared and resized upon chat clear
      setInput(''); 
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Chat Interface Component
  const ChatInterface = ({ isFloating }) => (
    <div
      className={`${
        isFloating
          ? 'w-[calc(100vw-2rem)] sm:w-96 md:w-[400px] h-[calc(100vh-6rem)] sm:h-[500px] md:h-[600px]'
          : 'w-full min-h-[717px] h-full max-h-screen'
      } bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden ${
        isFloating && isOpen && window.innerWidth <= 640
          ? 'fixed inset-0 w-full h-full rounded-none'
          : ''
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-bold text-sm">Gemini Assistant</h3>
            {selectedDocument ? (
              <p className="text-blue-100 text-xs truncate max-w-[150px] sm:max-w-[200px]">
                {selectedDocument.filename}
              </p>
            ) : (
              <p className="text-blue-100 text-xs">Ready to help!</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearChat}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            title="Clear chat"
          >
            <Trash2 size={18} />
          </button>
          {isFloating && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-gray-100 dark:scrollbar-track-slate-800"
      >
        <div className="min-h-full flex flex-col justify-end">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-2 sm:gap-3 mb-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                      : 'bg-gradient-to-br from-blue-600 to-blue-800'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User size={16} className="text-white" />
                  ) : (
                    <Bot size={16} className="text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] sm:max-w-[80%] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white border-2 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 block">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 sm:gap-3 mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border-2 border-gray-200 dark:border-slate-700">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
              </div>
            </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 border-t-2 border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            // CORRECT: Input value bound to state
            value={input}
            // CORRECT: Updates state on change
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            rows={1}
            disabled={loading}
            className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-100 dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white text-sm sm:text-base"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            whileHover={{ scale: input.trim() && !loading ? 1.05 : 1 }}
            whileTap={{ scale: input.trim() && !loading ? 0.95 : 1 }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center min-w-[44px] sm:min-w-[48px] ${
              input.trim() && !loading
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-900'
                : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center hidden sm:block">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );

  if (isEmbedded) {
    return <ChatInterface isFloating={false} />;
  }

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl transition-all ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-blue-500/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              className="flex items-center justify-center w-full h-full"
            >
              <X className="text-white" size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              className="flex items-center justify-center w-full h-full"
            >
              <MessageCircle className="text-white" size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`fixed z-50 ${
              window.innerWidth <= 640
                ? 'inset-0'
                : 'bottom-20 right-4 sm:bottom-24 sm:right-6'
            }`}
          >
            <ChatInterface isFloating={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIChatbot;