import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Loader, 
  AlertCircle, 
  Download, 
  Eye,
  CheckCircle,
  X
} from 'lucide-react';

const ModernPdfViewer: React.FC<{ pdfUrl?: string | null; onClose?: () => void }> = ({ pdfUrl, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  // Add parameters to hide PDF viewer toolbar and scrollbar
  const getPdfUrlWithoutToolbar = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    return `${url}#toolbar=0&navpanes=0&scrollbar=0`;
  };

  useEffect(() => {
    if (pdfUrl) {
      setLoading(true);
      setError(null);
      setIframeKey(prev => prev + 1);
    }
  }, [pdfUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to display document. The file might be corrupted or the URL inaccessible.');
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 shadow-2xl max-w-6xl w-full mx-auto rounded-2xl font-sans border-2 border-gray-200 dark:border-slate-700"
    >
      
      {/* Header with Controls */}
      <div className="flex w-full justify-between items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              Document Viewer
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              {loading && pdfUrl ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : pdfUrl ? (
                <>
                  <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Ready to view</span>
                </>
              ) : (
                <span>No document selected</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all inline-flex items-center gap-2"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </motion.button>
            </>
          )}
          
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
          )}
        </div>
      </div>
      
      {/* PDF Document Area */}
      <div 
        className="w-full border-2 border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-900 flex justify-center items-center relative shadow-inner" 
        style={{ height: '70vh' }}
      >
        
        {/* Loading Indicator */}
        <AnimatePresence>
          {loading && pdfUrl && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm z-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                  <Loader className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Loading Document...
              </span>
              <div className="flex gap-2">
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
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 z-20 p-8"
            >
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-red-700 dark:text-red-400 font-semibold text-lg text-center max-w-md">
                {error}
              </span>
              <p className="text-red-600 dark:text-red-500 text-sm mt-2 text-center">
                Please try refreshing or contact support if the issue persists.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial Prompt */}
        {!pdfUrl && !error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center border-dashed border-2 border-gray-300 dark:border-slate-600 rounded-xl h-full flex flex-col items-center justify-center bg-white dark:bg-slate-800 m-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Eye className="w-10 h-10 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Document Selected
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Upload or select a PDF to view it here
            </p>
          </motion.div>
        )}

        {/* Iframe for PDF display */}
        {pdfUrl && (
          <iframe
            key={iframeKey}
            src={getPdfUrlWithoutToolbar(pdfUrl)}
            title="PDF Document"
            className="w-full h-full border-0 bg-white dark:bg-slate-900"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          >
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-700 dark:text-red-400 font-medium">
                Your browser does not support inline PDFs. Please download the file to view it.
              </p>
            </div>
          </iframe>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full mt-4 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Scroll to navigate the document</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Use mouse wheel or trackpad to scroll</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ModernPdfViewer;