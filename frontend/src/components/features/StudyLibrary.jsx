import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Brain,
  Network,
  BookOpen,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  Search,
  Grid,
  List,
  ChevronRight,
  Loader,
  FolderOpen,
  Calendar,
  BarChart,
  CheckCircle, // New icon for Sessions
  Book, // New icon for Avg Length
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import DocumentUpload from './DocumentUpload';
import Summary from './Summary';
import Quiz from './Quiz';
import KnowledgeGraph from './KnowledgeGraph';
import PdfViewer from '../ui/PdfViewer';
import AIChatbot from './AIChat';

// Assuming your API base URL is http://localhost:5000/api
const API_BASE_URL = 'http://localhost:5000/api';

function StudyLibrary() {
  const { user, isLoaded } = useUser();

  const [activeView, setActiveView] = useState('library');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [viewUrl, setViewUrl] = useState('');
  // UPDATED: Added new stats fields for deeper analytics
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalQuizzes: 0,
    averageScore: 0,
    studyTime: 0, // in minutes
    totalSessions: 0, // NEW: e.g., total times user opened a document to view
    avgDocLength: 0, // NEW: e.g., average page count or word count
  });

  useEffect(() => {
    if (isLoaded && user) {
      loadDocuments();
      fetchStats();
    }
  }, [isLoaded, user]);

  // NEW FUNCTION: Fetch aggregated study stats from a separate analytics endpoint
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      // NOTE: This assumes you have a new backend route for aggregated user analytics
      const response = await axios.get(`${API_BASE_URL}/analytics/study-library/${user.id}`);
      const analyticsData = response.data.analytics || {};

      setStats((prevStats) => ({
        ...prevStats,
        // Update with data from analytics endpoint (e.g., from database aggregation)
        totalSessions: analyticsData.total_study_sessions || 0,
        avgDocLength: analyticsData.average_doc_length || 0,
      }));
    } catch (err) {
      console.error('Failed to fetch library analytics:', err);
    }
  };


  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${user.id}`);
      const docs = response.data.documents || [];

      setDocuments(docs);
      
      // Calculate derived stats from document list
      const totalQuizzes = docs.reduce((sum, doc) => sum + (doc.quizzes_taken || 0), 0);
      // Safely calculate total score and average score
      const docsWithScore = docs.filter(doc => (doc.average_score || 0) > 0);
      const totalScore = docsWithScore.reduce((sum, doc) => sum + (doc.average_score || 0), 0);
      const averageScore = docsWithScore.length ? totalScore / docsWithScore.length : 0;
      
      setStats((prevStats) => ({
        ...prevStats,
        totalDocuments: docs.length,
        totalQuizzes: totalQuizzes,
        averageScore: averageScore,
        studyTime: docs.reduce((sum, doc) => sum + (doc.study_time || 0), 0),
      }));
    } catch (err) {
      console.error('Failed to load documents:', err);
      if (err.response?.status !== 404) toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (data) => {
    toast.success('✨ Document uploaded successfully!');
    setSelectedDocument({
      doc_id: data.doc_id,
      filename: data.filename,
      summary: data.summary,
      uploaded_at: new Date().toISOString(),
    });
    setActiveView('summary');
    loadDocuments();
    fetchStats(); // Refresh stats on successful upload
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setActiveView('summary');
  };

  const handleViewPdfDocument = (doc, url) => {
    setSelectedDocument(doc);
    setViewUrl(url);
    setActiveView('view');
  };

  const handleGenerateQuiz = (data) => {
    setQuizData(data);
    setActiveView('quiz');
  };

  const handleViewKnowledgeGraph = (doc) => {
    setSelectedDocument(doc);
    setActiveView('graph');
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/documents/${docId}`);
      toast.success('Document deleted successfully');
      loadDocuments();
      fetchStats(); // Refresh stats on deletion
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleQuizComplete = () => {
    setActiveView('library');
    setQuizData(null);
    loadDocuments();
    fetchStats(); // Refresh stats on quiz completion
  };

  const handleBackToLibrary = () => {
    setActiveView('library');
    setSelectedDocument(null);
    setQuizData(null);
    setViewUrl('');
    loadDocuments();
    fetchStats(); // Refresh stats when returning to library
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'recent') {
      const uploadDate = new Date(doc.uploaded_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return matchesSearch && uploadDate > dayAgo;
    }

    if (filterType === 'completed') {
      return matchesSearch && (doc.quizzes_taken || 0) > 0;
    }

    return matchesSearch;
  });

  const renderContent = () => {
    switch (activeView) {
      case 'upload':
        return (
          <div>
            <BackButton onClick={handleBackToLibrary} />
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        );

      case 'summary':
        return (
          <div>
            <BackButton onClick={handleBackToLibrary} />
            {selectedDocument && (
              <Summary docData={selectedDocument} onGenerateQuiz={handleGenerateQuiz} />
            )}
          </div>
        );

      case 'quiz':
        return (
          <div>
            <BackButton onClick={handleBackToLibrary} />
            {quizData && (
              <Quiz
                quizData={quizData}
                quizId={quizData.quiz_id}
                userId={user.id}
                onComplete={handleQuizComplete}
              />
            )}
          </div>
        );

      case 'graph':
        return (
          <div>
            <BackButton onClick={handleBackToLibrary} />
            {selectedDocument && <KnowledgeGraph docData={selectedDocument} />}
          </div>
        );

      case 'view':
        return (
          <div>
            <BackButton onClick={handleBackToLibrary} />
            <div className="flex flex-col lg:flex-row gap-6">
              {/* PDF Viewer Section */}
              <div className="lg:flex-[2] w-full">
                <PdfViewer
                  pdfUrl={
                    viewUrl ||
                    'https://www.eks-intec.com/wp-content/uploads/2025/01/Sample-pdf.pdf'
                  }
                />
              </div>

              {/* AI Chatbot Section - Key added for proper re-initialization */}
              {selectedDocument && (
                <div className="lg:flex-[1] w-full lg:min-w-[400px] lg:h-full">
                  <AIChatbot 
                    key={selectedDocument.doc_id} // Key added here
                    selectedDocument={selectedDocument} 
                    isEmbedded={true} 
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        // PASS STATS to LibraryView
        return <LibraryView stats={stats} />;
    }
  };

  const BackButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
    >
      <ChevronRight className="rotate-180" size={20} />
      Back to Library
    </button>
  );

  // ACCEPT STATS as a prop
  const LibraryView = ({ stats }) => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Study Library
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal collection of AI-powered study materials
          </p>
        </div>

        <motion.button
          onClick={() => setActiveView('upload')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Upload size={20} />
          Upload New Document
        </motion.button>
      </div>

      {/* UPDATED: Stats Bar - Now 4x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={FileText} 
          title="Total Docs" 
          value={stats.totalDocuments} 
          color="text-purple-600" 
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard 
          icon={BarChart} 
          title="Avg Quiz Score" 
          value={`${Math.round(stats.averageScore)}%`} 
          color="text-green-600" 
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard 
          icon={Brain} 
          title="Quizzes Taken" 
          value={stats.totalQuizzes} 
          color="text-blue-600" 
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard 
          icon={Clock} 
          title="Total Study Time" 
          // Convert minutes to hours and format (0h if < 60 min)
          value={`${Math.round(stats.studyTime / 60)}h`} 
          color="text-orange-600" 
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
        {/* NEW: Analytics Stats - Now using 4 grid columns for a full row */}
        <StatCard 
          icon={CheckCircle} 
          title="Study Sessions" 
          value={stats.totalSessions} 
          color="text-pink-600" 
          bg="bg-pink-50 dark:bg-pink-900/20"
        />
        <StatCard 
          icon={Book} 
          title="Avg Doc Length" 
          // Assuming avgDocLength is page count or similar metric
          value={`${Math.round(stats.avgDocLength)} Pages`} 
          color="text-teal-600" 
          bg="bg-teal-50 dark:bg-teal-900/20"
        />
        <StatCard 
          icon={TrendingUp} 
          title="Improvement Trend" 
          // Placeholder, calculation would be more complex
          value="Good" 
          color="text-yellow-600" 
          bg="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard 
          icon={Network} 
          title="Knowledge Graphs" 
          // Placeholder
          value={stats.totalDocuments} 
          color="text-indigo-600" 
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
      </div>
      <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="all">All Documents</option>
            <option value="recent">Recent (24h)</option>
            <option value="completed">Completed</option>
          </select>

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow-md'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 shadow-md'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your library...</p>
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
              <FolderOpen className="text-purple-600 dark:text-purple-400" size={64} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Documents Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your first document to start learning with AI
            </p>
            <motion.button
              onClick={() => setActiveView('upload')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Upload size={20} />
              Upload Your First Document
            </motion.button>
          </motion.div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDocuments.map((doc, idx) => (
                <DocumentCard
                  key={doc.doc_id}
                  doc={doc}
                  idx={idx}
                  onView={handleViewDocument}
                  onViewGraph={handleViewKnowledgeGraph}
                  onDelete={handleDeleteDocument}
                  onViewPdf={handleViewPdfDocument}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredDocuments.map((doc, idx) => (
                <DocumentListItem
                  key={doc.doc_id}
                  doc={doc}
                  idx={idx}
                  onView={handleViewDocument}
                  onViewGraph={handleViewKnowledgeGraph}
                  onDelete={handleDeleteDocument}
                  onViewPdf={handleViewPdfDocument}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ================================
// 📊 Stat Card Component
// ================================
const StatCard = ({ icon: Icon, title, value, color, bg }) => {
  return (
    <div className={`flex items-center p-4 rounded-xl shadow-md ${bg}`}>
      <div className={`p-3 rounded-full ${bg} mr-4`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

// ================================
// 📘 Document Card Component
// ================================
function DocumentCard({ doc, idx, onView, onViewGraph, onDelete, onViewPdf }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
    >
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 relative overflow-hidden">
        <div className="text-5xl mb-3">📄</div>
        <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">{doc.filename}</h3>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Calendar size={14} />
          {formatDate(doc.uploaded_at)}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {doc.quizzes_taken || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Quizzes</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(doc.average_score || 0)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onView(doc)}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <BookOpen size={16} />
            View Summary & Quiz
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                onViewPdf(
                  doc,
                  doc.file_url ||
                    'https://www.eks-intec.com/wp-content/uploads/2025/01/Sample-pdf.pdf'
                )
              }
              className="px-3 py-2 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-all flex items-center justify-center gap-1 text-sm"
            >
              <Eye size={14} />
              View
            </button>

            <button
              onClick={() => onViewGraph(doc)}
              className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center justify-center gap-1 text-sm"
            >
              <Network size={14} />
              Graph
            </button>

            <button
              onClick={() => onDelete(doc.doc_id)}
              className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center justify-center gap-1 text-sm"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ================================
// 📋 Document List Item Component
// ================================
function DocumentListItem({ doc, idx, onView, onViewGraph, onDelete, onViewPdf }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-xl transition-all"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-4xl">📄</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-1">
              {doc.filename}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(doc.uploaded_at)}
              </span>
              <span>Quizzes: {doc.quizzes_taken || 0}</span>
              <span>Score: {Math.round(doc.average_score || 0)}%</span>
            </div>
          </div>
          
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(doc)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <BookOpen size={16} />
            Summary
          </button>
          <button
            onClick={() =>
              onViewPdf(
                doc,
                doc.file_url ||
                  'https://www.eks-intec.com/wp-content/uploads/2025/01/Sample-pdf.pdf'
              )
            }
            className="px-4 py-2 bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-900/50 transition-all flex items-center gap-2"
          >
            <Eye size={16} />
            View
          </button>
          <button
            onClick={() => onViewGraph(doc)}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all flex items-center gap-2"
          >
            <Network size={16} />
            Graph
          </button>
          <button
            onClick={() => onDelete(doc.doc_id)}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default StudyLibrary;