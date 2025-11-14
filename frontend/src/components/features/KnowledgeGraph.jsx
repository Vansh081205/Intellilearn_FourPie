import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, X, BookOpen, Brain, Zap, RefreshCw, AlertCircle, Loader } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ForceGraph2D from 'react-force-graph-2d';

function KnowledgeGraph({ docData }) {
  const { user } = useUser();
  const graphRef = useRef();
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [flashcardData, setFlashcardData] = useState(null);
  const [isLoadingFlashcard, setIsLoadingFlashcard] = useState(false);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Memoize graph data with initial positions
  const positionedGraphData = useMemo(() => {
    if (!graphData.nodes.length) return { nodes: [], links: [] };

    const container = document.getElementById('graph-container');
    const width = container ? container.clientWidth : 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const positionedNodes = graphData.nodes.map((node, idx) => {
      if (node.level === 0) {
        node.fx = centerX;
        node.fy = centerY;
      } else {
        const angle = (2 * Math.PI * (idx - 1)) / (graphData.nodes.length - 1);
        const radius = Math.min(width, height) / 3;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
      }
      return node;
    });

    return { nodes: positionedNodes, links: graphData.links };
  }, [graphData]);

  // Fetch data
  useEffect(() => {
    if (docData?.doc_id) {
      loadGraphData();
    } else {
      setErrorMessage('Please upload a document first to generate its graph.');
      setIsLoading(false);
    }
  }, [docData]);

  const loadGraphData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/knowledge-graph/generate',
        { doc_id: docData.doc_id, user_id: user?.id || 'demo' },
        { timeout: 20000 }
      );
      
      if (response.data?.nodes?.length > 0) {
        setGraphData(response.data);
        toast.success('🤖 AI generated your knowledge graph!', { duration: 4000 });
      } else {
        throw new Error('API returned no concepts.');
      }
      
    } catch (error) {
      let msg = error.response?.data?.error || error.message || 'Network error';
      setErrorMessage(`Failed to generate graph: ${msg}`);
      toast.error(`Failed to generate graph: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNode(node);
    setShowFlashcard(true);
    setIsLoadingFlashcard(true);
    setFlashcardData(null);
    
    graphRef.current.centerAt(node.x, node.y, 1000);
    graphRef.current.zoom(2.5, 1000);
    
    try {
      const response = await axios.post(
        `http://localhost:5000/api/knowledge-graph/explain/${encodeURIComponent(node.label)}`,
        { doc_id: docData?.doc_id }
      );
      setFlashcardData(response.data);
    } catch (error) {
      setFlashcardData({
        explanation: node.definition || 'Key concept from your document.',
        keyPoints: ['Review related sections.', 'Practice with examples.'],
      });
    } finally {
      setIsLoadingFlashcard(false);
    }
  }, [docData, graphRef]);
  
  // ✅ NEW FUNCTION TO HANDLE CLOSING THE CARD AND ZOOMING OUT
  const handleCloseFlashcard = () => {
    setShowFlashcard(false);
    if (graphRef.current) {
      graphRef.current.zoomToFit(600, 100); // Animate zoom out over 600ms
    }
  };
  
  const handleBackgroundClick = useCallback(() => {
    graphRef.current.zoomToFit(400, 100);
  }, [graphRef]);

  const renderNode = useMemo(() => (node, ctx, globalScale) => {
    const isHovered = hoveredNode && node.id === hoveredNode.id;
    const size = node.size * (isHovered ? 1.25 : 1);
    
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    const label = node.label;
    const fontSize = size / 3;
    if (globalScale > 0.8) {
      ctx.font = `bold ${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText(label, node.x, node.y);
    }
  }, [hoveredNode]);

  const handleNodeDragEnd = node => {
    node.fx = node.x;
    node.fy = node.y;
  };
  
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      graphRef.current.d3Force('charge').strength(-1200);
      graphRef.current.d3Force('link').distance(link => (link.source.level === 0 || link.target.level === 0) ? 200 : 120);
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  // Handle resizing
  useEffect(() => {
    const container = document.getElementById('graph-container');
    if (container) {
      const handleResize = () => {
        setDimensions({ width: container.clientWidth, height: 600 });
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [graphData]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Network className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Knowledge Graph
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                A dynamic map of your study material. Drag nodes to explore.
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={loadGraphData}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 flex items-center gap-2"
              disabled={!docData?.doc_id}
            >
              <RefreshCw size={18} /> Regenerate
            </button>
          )}
        </div>

        {/* Content Area */}
        <div id="graph-container" className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl border-2 border-gray-700 min-h-[600px] flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#A5B4FC 1px, transparent 1px)', backgroundSize: '2rem 2rem'}} />

          {isLoading ? (
            <div className="text-center text-white z-10">
              <Loader className="animate-spin h-16 w-16 text-purple-400 mx-auto mb-4" />
              <p className="text-lg font-semibold">Generating AI Graph...</p>
            </div>
          ) : errorMessage ? (
            <div className="text-center text-red-400 max-w-lg p-6 z-10">
              <AlertCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="font-bold">Failed to Generate Graph</h3>
              <p className="font-mono mt-2">{errorMessage}</p>
            </div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={positionedGraphData}
              width={dimensions.width}
              height={dimensions.height}
              
              nodeCanvasObject={renderNode}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size * 1.5, 0, 2 * Math.PI, false);
                ctx.fill();
              }}

              linkColor={() => 'rgba(255,255,255,0.2)'}
              linkWidth={2}
              
              onNodeClick={handleNodeClick}
              onNodeHover={setHoveredNode}
              onNodeDragEnd={handleNodeDragEnd}
              onBackgroundClick={handleBackgroundClick}
              
              cooldownTicks={0}
              forceEngine="d3"
            />
          )}
        </div>
      </div>

      {/* Flashcard Modal */}
      <AnimatePresence>
        {showFlashcard && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={handleCloseFlashcard} // ✅ USE THE NEW FUNCTION HERE
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-6 flex justify-between items-center" style={{ background: `linear-gradient(135deg, ${selectedNode.color}99, ${selectedNode.color}ff)` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{selectedNode.label}</h3>
                </div>
                <button onClick={handleCloseFlashcard} className="text-white/80 hover:text-white"><X /></button> {/* ✅ USE THE NEW FUNCTION HERE */}
              </div>
              <div className="p-6 space-y-6">
                {isLoadingFlashcard ? (
                  <div className="text-center py-10">
                    <Loader className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-3" />
                    <p>AI is generating explanation...</p>
                  </div>
                ) : flashcardData ? (
                  <>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300"><Brain size={20} /> Explanation</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{flashcardData.explanation}</p>
                    </div>
                    {flashcardData.keyPoints && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><Zap size={20} /> Key Points</h4>
                        <ul className="space-y-2 pl-5 list-disc text-gray-700 dark:text-gray-300">
                          {flashcardData.keyPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : <p>No details available.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default KnowledgeGraph;