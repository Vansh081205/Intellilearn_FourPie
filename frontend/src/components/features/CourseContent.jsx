import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  HelpCircle,
  Download,
  Bookmark,
  Share2,
  MessageSquare,
  ThumbsUp,
  ArrowLeft,
  Menu,
  X,
  Lightbulb,
  Code,
  Image as ImageIcon,
  AlertCircle,
  Send,
  Edit2,
  Trash2,
  MoreVertical,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Settings,
  Pause,
  Play,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Info
} from 'lucide-react';

// Helper functions
function generateLessonTitle(weekTitle, lessonIdx, type) {
  const titles = {
    'Introduction to ML': ['What is Machine Learning?', 'Types of ML', 'ML Applications', 'ML Tools & Setup'],
    'Supervised Learning': ['Linear Regression', 'Classification Basics', 'Decision Trees', 'Model Evaluation', 'Ensemble Methods'],
    'Neural Networks': ['Perceptrons', 'Activation Functions', 'Backpropagation', 'Deep Networks', 'Optimization', 'Regularization'],
    'Deep Learning': ['CNNs Introduction', 'Image Recognition', 'RNNs & LSTM', 'Sequence Models', 'Transfer Learning'],
    'Advanced Topics': ['GANs', 'Reinforcement Learning', 'Transformers', 'Model Deployment'],
    'Basics of Organic Chemistry': ['Carbon Chemistry', 'Bonding', 'Functional Groups', 'Nomenclature'],
    'Functional Groups': ['Alcohols', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Amines', 'Esters'],
    'Reaction Mechanisms': ['Nucleophilic Substitution', 'Elimination Reactions', 'Addition Reactions', 'Oxidation-Reduction'],
    'Synthesis': ['Retrosynthesis', 'Multi-step Synthesis', 'Protection Groups', 'Stereochemistry', 'Total Synthesis'],
    'Dawn of Renaissance': ['Italian City-States', 'Humanism', 'Patronage System'],
    'Art & Architecture': ['Perspective', 'Sculpture', 'Architecture', 'Famous Artists'],
    'The Italian States': ['Florence', 'Venice', 'Rome', 'Milan'],
    'Legacy & Impact': ['Renaissance Spread', 'Scientific Revolution', 'Cultural Impact', 'Modern Influence'],
    'Integration Fundamentals': ['Definite Integrals', 'Indefinite Integrals', 'Fundamental Theorem', 'U-Substitution'],
    'Advanced Techniques': ['Integration by Parts', 'Trigonometric Integration', 'Partial Fractions', 'Improper Integrals', 'Numerical Integration'],
    'Applications': ['Area Between Curves', 'Volume of Revolution', 'Arc Length', 'Surface Area', 'Work & Energy', 'Center of Mass'],
    'Series & Sequences': ['Sequences', 'Series Convergence', 'Power Series', 'Taylor Series', 'Applications'],
    // Python Programming
    'Python Basics': ['Variables & Data Types', 'Operators', 'Control Flow', 'Functions Intro'],
    'Data Structures': ['Lists', 'Tuples', 'Dictionaries', 'Sets', 'List Comprehensions'],
    'OOP in Python': ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Magic Methods'],
    'Advanced Python': ['Decorators', 'Generators', 'Context Managers', 'Async/Await', 'Metaclasses'],
    // Data Science
    'Data Analysis Basics': ['NumPy Fundamentals', 'Pandas Basics', 'Data Cleaning', 'EDA'],
    'Visualization': ['Matplotlib', 'Seaborn', 'Plotly', 'Interactive Dashboards'],
    'Statistical Analysis': ['Descriptive Statistics', 'Inferential Statistics', 'Hypothesis Testing', 'Correlation'],
    'ML with Scikit-learn': ['Preprocessing', 'Model Selection', 'Cross Validation', 'Hyperparameter Tuning'],
    // Web Development
    'HTML & CSS': ['HTML Structure', 'CSS Styling', 'Flexbox', 'Grid Layout', 'Responsive Design'],
    'JavaScript Basics': ['Variables & Types', 'DOM Manipulation', 'Events', 'Async JavaScript'],
    'React Fundamentals': ['Components', 'Props & State', 'Hooks', 'Lifecycle', 'Context API'],
    'Backend Development': ['Node.js Basics', 'Express.js', 'REST APIs', 'Database Integration'],
    // Digital Marketing
    'Marketing Fundamentals': ['Market Research', 'Consumer Behavior', 'Marketing Mix', 'Branding'],
    'Social Media Marketing': ['Platform Strategy', 'Content Creation', 'Community Management', 'Analytics'],
    'SEO & SEM': ['Keyword Research', 'On-Page SEO', 'Link Building', 'Google Ads', 'Analytics'],
    'Content Marketing': ['Content Strategy', 'Copywriting', 'Email Marketing', 'Marketing Automation'],
    // Business Strategy
    'Strategy Basics': ['Strategic Planning', 'SWOT Analysis', 'Competitive Analysis', 'Value Chain'],
    'Business Models': ['Business Model Canvas', 'Revenue Streams', 'Cost Structure', 'Partnerships'],
    'Innovation': ['Design Thinking', 'Lean Startup', 'Agile Methods', 'Digital Transformation'],
    'Leadership': ['Leadership Styles', 'Team Building', 'Change Management', 'Decision Making'],
    // Photography
    'Camera Basics': ['Camera Types', 'Exposure Triangle', 'Focusing', 'Camera Modes'],
    'Composition': ['Rule of Thirds', 'Leading Lines', 'Framing', 'Symmetry', 'Perspective'],
    'Lighting': ['Natural Light', 'Artificial Light', 'Light Modifiers', 'Studio Setup'],
    'Post-Processing': ['Lightroom Basics', 'Color Grading', 'Retouching', 'Export Settings'],
    // Music Theory
    'Music Fundamentals': ['Notes & Scales', 'Intervals', 'Key Signatures', 'Time Signatures'],
    'Harmony': ['Chord Construction', 'Chord Progressions', 'Voice Leading', 'Harmonic Analysis'],
    'Melody & Rhythm': ['Melodic Writing', 'Rhythmic Patterns', 'Syncopation', 'Phrasing'],
    'Composition': ['Song Structure', 'Arrangement', 'Orchestration', 'Production Basics'],
    // Fitness & Nutrition
    'Exercise Science': ['Anatomy Basics', 'Muscle Groups', 'Exercise Types', 'Workout Design'],
    'Strength Training': ['Progressive Overload', 'Compound Movements', 'Isolation Exercises', 'Recovery'],
    'Nutrition Basics': ['Macronutrients', 'Micronutrients', 'Meal Planning', 'Supplements'],
    'Wellness': ['Sleep Optimization', 'Stress Management', 'Flexibility', 'Injury Prevention'],
    // Default
    'Getting Started': ['Introduction', 'Setup', 'Basics', 'First Steps'],
    'Core Concepts': ['Concept 1', 'Concept 2', 'Concept 3', 'Practical Applications'],
    'Advanced Topics': ['Advanced Topic 1', 'Advanced Topic 2', 'Case Studies', 'Projects'],
    'Final Project': ['Planning', 'Implementation', 'Testing', 'Deployment']
  };

  const weekTitles = titles[weekTitle] || ['Topic A', 'Topic B', 'Topic C', 'Topic D', 'Topic E'];
  return weekTitles[lessonIdx] || `Topic ${lessonIdx + 1}`;
}

function generateLessonContent(weekTitle, lessonIdx, type, course) {
  if (type === 'video') {
    return {
      videoUrl: 'https://www.example.com/video.mp4',
      transcript: `This is a comprehensive video lesson covering ${weekTitle}. In this lesson, we'll explore the fundamental concepts and practical applications. You'll learn step-by-step how to apply these principles in real-world scenarios.`,
      keyPoints: [
        'Understanding core concepts',
        'Practical applications',
        'Common pitfalls to avoid',
        'Best practices'
      ]
    };
  } else if (type === 'reading') {
    return {
      text: generateReadingContent(weekTitle, course),
      images: ['https://via.placeholder.com/800x400'],
      references: ['Textbook Chapter 3', 'Research Paper by Smith et al.', 'Online Tutorial']
    };
  } else if (type === 'exercise') {
    return {
      description: 'Complete the following exercises to practice what you\'ve learned.',
      problems: [
        { id: 1, question: 'Solve for x: 2x + 5 = 15', answer: 'x = 5' },
        { id: 2, question: 'Apply the concept to a real-world scenario', answer: 'Detailed solution...' }
      ]
    };
  }
  return {};
}

function generateReadingContent(weekTitle, course) {
  return `# ${weekTitle}

## Introduction

Welcome to this comprehensive lesson on ${weekTitle}. This topic is crucial for understanding ${course.title}.

## Core Concepts

In this section, we'll explore the fundamental principles that govern this topic. Understanding these concepts is essential for mastering the material.

### Key Principle 1

The first principle we need to understand is how these concepts interconnect. This forms the foundation for everything that follows.

### Key Principle 2

Building on the first principle, we now examine how these ideas apply in practical scenarios. Real-world applications help solidify understanding.

## Detailed Explanation

Let's dive deeper into the specifics. Each component plays a vital role in the overall system, and understanding their interactions is crucial.

### Example 1

Consider this practical example that demonstrates the concept in action. Notice how the principles we discussed earlier come into play.

### Example 2

Here's another scenario that shows a different application of the same principles. This variety helps reinforce the flexibility of the concepts.

## Common Applications

These concepts are widely used in various fields including:

- Industry applications
- Research settings
- Educational contexts
- Practical problem-solving

## Summary

To summarize, we've covered the essential aspects of ${weekTitle}, including core principles, practical applications, and real-world examples. Make sure you understand these concepts before moving forward.

## Practice Questions

1. What are the main principles covered in this lesson?
2. How do these concepts apply to real-world scenarios?
3. Can you identify examples from your own experience?
`;
}

function generateResources(type) {
  return [
    { name: 'Lecture Slides', icon: FileText, url: '#' },
    { name: 'Additional Reading', icon: BookOpen, url: '#' },
    { name: 'Practice Problems', icon: HelpCircle, url: '#' },
    { name: 'Code Examples', icon: Code, url: '#' }
  ];
}

function generateQuiz(weekTitle, lessonIdx) {
  return {
    questions: [
      {
        id: 1,
        question: `What is the main concept in ${weekTitle}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 1
      },
      {
        id: 2,
        question: 'How does this apply in practice?',
        options: ['Application 1', 'Application 2', 'Application 3', 'Application 4'],
        correct: 2
      }
    ]
  };
}

function generateLessonsForWeek(week, weekIdx, course, lessonCompletionState = {}) {
  const lessons = [];
  const lessonTypes = ['video', 'reading', 'quiz', 'exercise'];

  for (let i = 0; i < week.lessons; i++) {
    const type = lessonTypes[i % lessonTypes.length];
    const lessonId = `${week.week}-${i + 1}`;

    const isCompleted = lessonCompletionState[lessonId] !== undefined
      ? lessonCompletionState[lessonId]
      : i < week.completed;

    const isPreviousWeekComplete = weekIdx === 0 || course.syllabus[weekIdx - 1].completed >= course.syllabus[weekIdx - 1].lessons;

    lessons.push({
      id: lessonId,
      weekId: week.week,
      title: `Lesson ${i + 1}: ${generateLessonTitle(week.title, i, type)}`,
      type: type,
      duration: type === 'video' ? `${12 + i * 2} min` : type === 'reading' ? `${8 + i} min read` : `${5 + i} min`,
      completed: isCompleted,
      locked: !isPreviousWeekComplete,
      content: generateLessonContent(week.title, i, type, course),
      resources: generateResources(type),
      quiz: type === 'quiz' ? generateQuiz(week.title, i) : null
    });
  }

  return lessons;
}

// LocalStorage helper functions
const STORAGE_KEY = 'intellilearn_course_data';
const COMMENTS_STORAGE_KEY = 'intellilearn_comments';
const BOOKMARKS_STORAGE_KEY = 'intellilearn_bookmarks';
const FOCUS_MODE_KEY = 'intellilearn_focus_settings';
const FOCUS_SESSION_KEY = 'intellilearn_focus_session';

function loadCourseProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading course progress:', error);
    return {};
  }
}

function saveCourseProgress(courseId, lessonCompletionState) {
  try {
    const allData = loadCourseProgress();
    allData[courseId] = {
      lessonCompletionState,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    console.error('Error saving course progress:', error);
  }
}

function loadComments() {
  try {
    const data = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading comments:', error);
    return {};
  }
}

function saveComments(comments) {
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  } catch (error) {
    console.error('Error saving comments:', error);
  }
}

function loadBookmarks() {
  try {
    const data = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return {};
  }
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
}

function loadFocusSettings() {
  try {
    const data = localStorage.getItem(FOCUS_MODE_KEY);
    return data ? JSON.parse(data) : {
      hideTimer: false,
      dimBackground: true,
      autoHideControls: true,
      parentalControl: false,
      strictMode: false,
      maxTabSwitches: 3
    };
  } catch (error) {
    return {
      hideTimer: false,
      dimBackground: true,
      autoHideControls: true,
      parentalControl: false,
      strictMode: false,
      maxTabSwitches: 3
    };
  }
}

function saveFocusSettings(settings) {
  try {
    localStorage.setItem(FOCUS_MODE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving focus settings:', error);
  }
}

function loadFocusSession() {
  try {
    const data = localStorage.getItem(FOCUS_SESSION_KEY);
    return data ? JSON.parse(data) : { tabSwitchCount: 0, violations: [] };
  } catch (error) {
    return { tabSwitchCount: 0, violations: [] };
  }
}

function saveFocusSession(session) {
  try {
    localStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving focus session:', error);
  }
}

function generateSampleComments() {
  return [
    {
      id: Date.now() + Math.random(),
      author: 'Sarah Johnson',
      avatar: 'SJ',
      avatarColor: 'from-blue-500 to-indigo-600',
      text: 'Great lesson! This really helped clarify the concepts. The examples were particularly useful.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 5,
      likedBy: [],
      replies: []
    },
    {
      id: Date.now() + Math.random() + 1,
      author: 'Michael Chen',
      avatar: 'MC',
      avatarColor: 'from-purple-500 to-pink-600',
      text: 'The instructor explains complex topics in a very understandable way. Looking forward to the next lesson!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 8,
      likedBy: [],
      replies: [
        {
          id: Date.now() + Math.random() + 2,
          author: 'Emily Davis',
          avatar: 'ED',
          avatarColor: 'from-green-500 to-emerald-600',
          text: 'I agree! The step-by-step approach makes everything so clear.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          likes: 3,
          likedBy: []
        }
      ]
    }
  ];
}

export default function CourseContent({ course, onBack, onNavigate, onProgressUpdate }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [lessonCompletionState, setLessonCompletionState] = useState({});
  const [showToast, setShowToast] = useState('');

  // Comment system state
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showCommentMenu, setShowCommentMenu] = useState(null);

  // Bookmark state
  const [bookmarks, setBookmarks] = useState({});

  // Focus Mode state
  const [focusMode, setFocusMode] = useState(false);
  const [focusSettings, setFocusSettings] = useState(loadFocusSettings());
  const [showFocusSettings, setShowFocusSettings] = useState(false);
  const [focusTimer, setFocusTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [isHoveringSettings, setIsHoveringSettings] = useState(false);

  // Tab switching tracking
  const [focusSession, setFocusSession] = useState(loadFocusSession());
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const fullscreenRef = useRef(null);

  // Load saved progress on mount
  useEffect(() => {
    const savedData = loadCourseProgress();
    if (savedData[course.id]) {
      setLessonCompletionState(savedData[course.id].lessonCompletionState || {});
    }

    const savedComments = loadComments();
    setComments(savedComments);

    const savedBookmarks = loadBookmarks();
    setBookmarks(savedBookmarks);
  }, [course.id]);

  // Initialize comments for lesson if none exist
  useEffect(() => {
    if (selectedLesson && !comments[selectedLesson.id]) {
      const updatedComments = {
        ...comments,
        [selectedLesson.id]: generateSampleComments()
      };
      setComments(updatedComments);
      saveComments(updatedComments);
    }
  }, [selectedLesson]);

  // Focus mode timer
  useEffect(() => {
    let interval;
    if (timerRunning && focusMode) {
      interval = setInterval(() => {
        setFocusTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, focusMode]);

  // Auto-hide controls in focus mode (modified to not hide when hovering settings)
  useEffect(() => {
    if (focusMode && focusSettings.autoHideControls) {
      const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);

        // Don't auto-hide if hovering over settings
        if (!isHoveringSettings) {
          const timeout = setTimeout(() => setShowControls(false), 3000);
          setControlsTimeout(timeout);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeout) clearTimeout(controlsTimeout);
      };
    }
  }, [focusMode, focusSettings.autoHideControls, isHoveringSettings]);

  // Tab visibility tracking for focus mode
  useEffect(() => {
    if (focusMode) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Tab was switched away
          setIsTabActive(false);

          const newSession = {
            ...focusSession,
            tabSwitchCount: focusSession.tabSwitchCount + 1,
            violations: [
              ...focusSession.violations,
              {
                timestamp: new Date().toISOString(),
                type: 'tab_switch',
                lesson: selectedLesson?.title
              }
            ]
          };

          setFocusSession(newSession);
          saveFocusSession(newSession);

          // Show warning if parental control is enabled
          if (focusSettings.parentalControl) {
            setShowTabWarning(true);

            // Check if max switches exceeded
            if (focusSettings.strictMode && newSession.tabSwitchCount >= focusSettings.maxTabSwitches) {
              setShowViolationWarning(true);
              // In strict mode, pause timer
              setTimerRunning(false);
            }
          }
        } else {
          // Tab became active again
          setIsTabActive(true);
          if (!focusSettings.strictMode || focusSession.tabSwitchCount < focusSettings.maxTabSwitches) {
            setTimeout(() => setShowTabWarning(false), 3000);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [focusMode, focusSession, focusSettings, selectedLesson]);

  // Fullscreen API
  const enterFullscreen = async () => {
    try {
      const element = fullscreenRef.current || document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }

      return true;
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      displayToast('⚠️ Fullscreen not supported on this browser');
      return false;
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      // If user exits fullscreen while in focus mode, exit focus mode
      if (!isFullscreen && focusMode) {
        setFocusMode(false);
        setTimerRunning(false);
        displayToast('👋 Focus Mode deactivated - Fullscreen exited');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [focusMode]);

  // Keyboard shortcuts for focus mode
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        toggleFocusMode();
      }
      if (focusMode) {
        if (e.key === 'Escape') {
          exitFocusMode();
        }
        if (e.key === 'ArrowRight' && e.ctrlKey) {
          e.preventDefault();
          nextLesson();
        }
        if (e.key === 'ArrowLeft' && e.ctrlKey) {
          e.preventDefault();
          previousLesson();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusMode]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFocusMode = async () => {
    if (!focusMode) {
      // Entering focus mode
      const success = await enterFullscreen();
      if (success) {
        setFocusMode(true);
        setSidebarOpen(false);
        setShowNotes(false);
        setTimerRunning(true);

        // Reset session for new focus session
        const newSession = { tabSwitchCount: 0, violations: [] };
        setFocusSession(newSession);
        saveFocusSession(newSession);

        displayToast('🎯 Focus Mode activated! Press ESC to exit');
      }
    } else {
      exitFocusMode();
    }
  };

  const exitFocusMode = async () => {
    await exitFullscreen();
    setFocusMode(false);
    setTimerRunning(false);
    setShowViolationWarning(false);
    setShowFocusSettings(false);
    displayToast('👋 Focus Mode deactivated');
  };

  const updateFocusSettings = (key, value) => {
    const newSettings = { ...focusSettings, [key]: value };
    setFocusSettings(newSettings);
    saveFocusSettings(newSettings);

    if (key === 'strictMode' && value === false) {
      // Reset violations when strict mode is disabled
      setShowViolationWarning(false);
    }
  };

  const resetTabSwitches = () => {
    const newSession = { tabSwitchCount: 0, violations: [] };
    setFocusSession(newSession);
    saveFocusSession(newSession);
    setShowViolationWarning(false);
    setTimerRunning(true);
    displayToast('✅ Tab switch counter reset!');
  };

  if (!course || !course.syllabus || course.syllabus.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Course Data Not Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load course content. Please try again.
          </p>
          <button onClick={onBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const courseContent = useMemo(() => ({
    weeks: course.syllabus.map((week, weekIdx) => ({
      ...week,
      lessonCount: week.lessons,
      lessons: generateLessonsForWeek(week, weekIdx, course, lessonCompletionState)
    }))
  }), [course.syllabus, lessonCompletionState]);

  const calculateProgress = () => {
    const allLessons = courseContent.weeks.flatMap(w => w.lessons);
    const completedCount = allLessons.filter(l => l.completed).length;
    const totalCount = allLessons.length;
    return {
      percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      completedCount,
      totalCount
    };
  };

  useEffect(() => {
    if (!selectedLesson && courseContent.weeks.length > 0) {
      const firstIncomplete = findFirstIncompleteLesson(courseContent);
      if (firstIncomplete) {
        setSelectedLesson(firstIncomplete);
      }
    }
  }, [courseContent]);

  function findFirstIncompleteLesson(courseContent) {
    for (const week of courseContent.weeks) {
      for (const lesson of week.lessons) {
        if (!lesson.completed && !lesson.locked) {
          return lesson;
        }
      }
    }
    return courseContent.weeks[0]?.lessons[0] || null;
  }

  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev =>
      prev.includes(weekId) ? prev.filter(id => id !== weekId) : [...prev, weekId]
    );
  };

  const handleLessonSelect = (lesson) => {
    if (!lesson.locked) {
      setSelectedLesson(lesson);
      setNewComment('');
      setReplyingTo(null);
      setReplyText('');
      setEditingComment(null);
      setShowCommentMenu(null);

      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } else {
      displayToast('🔒 Complete previous weeks to unlock this lesson');
    }
  };

  const displayToast = (message) => {
    setShowToast(message);
    setTimeout(() => setShowToast(''), 3000);
  };

  const markAsComplete = () => {
    if (!selectedLesson) return;

    const newCompletionState = {
      ...lessonCompletionState,
      [selectedLesson.id]: !selectedLesson.completed
    };

    setLessonCompletionState(newCompletionState);
    saveCourseProgress(course.id, newCompletionState);

    setSelectedLesson({
      ...selectedLesson,
      completed: !selectedLesson.completed
    });

    const allLessons = courseContent.weeks.flatMap(w => w.lessons);
    const completedCount = allLessons.filter(l => {
      return newCompletionState[l.id] !== undefined ? newCompletionState[l.id] : l.completed;
    }).length;
    const totalCount = allLessons.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (onProgressUpdate) {
      onProgressUpdate(course.id, newProgress, completedCount);
    }

    displayToast(selectedLesson.completed ? '↩️ Lesson marked as incomplete' : '✅ Lesson completed!');
  };

  const nextLesson = () => {
    const allLessons = courseContent.weeks.flatMap(w => w.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson?.id);
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1];
      if (!next.locked) {
        handleLessonSelect(next);
        displayToast('➡️ Moving to next lesson');
      } else {
        displayToast('🔒 Complete previous weeks to unlock');
      }
    } else {
      displayToast('🎉 You\'ve reached the end of the course!');
    }
  };

  const previousLesson = () => {
    const allLessons = courseContent.weeks.flatMap(w => w.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson?.id);
    if (currentIndex > 0) {
      handleLessonSelect(allLessons[currentIndex - 1]);
      displayToast('⬅️ Moving to previous lesson');
    } else {
      displayToast('ℹ️ This is the first lesson');
    }
  };

  const handleBookmark = () => {
    if (!selectedLesson) return;

    const bookmarkKey = `${course.id}-${selectedLesson.id}`;
    const newBookmarks = {
      ...bookmarks,
      [bookmarkKey]: !bookmarks[bookmarkKey]
    };

    setBookmarks(newBookmarks);
    saveBookmarks(newBookmarks);
    displayToast(newBookmarks[bookmarkKey] ? '🔖 Lesson bookmarked!' : '🔖 Bookmark removed');
  };

  const isBookmarked = selectedLesson ? bookmarks[`${course.id}-${selectedLesson.id}`] : false;

  const handleShare = async () => {
    const shareData = {
      title: course.title,
      text: `Check out this lesson: ${selectedLesson?.title || 'Course Content'}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        displayToast('📤 Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        displayToast('📋 Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        displayToast('❌ Unable to share');
      }
    }
  };

  const saveNotes = () => {
    localStorage.setItem(`notes-${course.id}-${selectedLesson?.id}`, userNotes);
    displayToast('💾 Notes saved successfully!');
  };

  useEffect(() => {
    if (selectedLesson) {
      const savedNotes = localStorage.getItem(`notes-${course.id}-${selectedLesson.id}`) || '';
      setUserNotes(savedNotes);
    }
  }, [selectedLesson, course.id]);

  // Comment functions
  const handlePostComment = () => {
    if (!newComment.trim() || !selectedLesson) return;

    const comment = {
      id: Date.now(),
      author: 'You',
      avatar: 'YO',
      avatarColor: 'from-blue-500 to-cyan-600',
      text: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      replies: []
    };

    const updatedComments = {
      ...comments,
      [selectedLesson.id]: [comment, ...(comments[selectedLesson.id] || [])]
    };

    setComments(updatedComments);
    saveComments(updatedComments);
    setNewComment('');
    displayToast('💬 Comment posted!');
  };

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    if (!selectedLesson) return;

    const lessonComments = [...(comments[selectedLesson.id] || [])];

    if (isReply && parentId) {
      const parentIndex = lessonComments.findIndex(c => c.id === parentId);
      if (parentIndex !== -1) {
        const replyIndex = lessonComments[parentIndex].replies.findIndex(r => r.id === commentId);
        if (replyIndex !== -1) {
          const reply = lessonComments[parentIndex].replies[replyIndex];
          const userId = 'current-user';
          const hasLiked = reply.likedBy?.includes(userId);

          lessonComments[parentIndex].replies[replyIndex] = {
            ...reply,
            likes: hasLiked ? reply.likes - 1 : reply.likes + 1,
            likedBy: hasLiked
              ? reply.likedBy.filter(id => id !== userId)
              : [...(reply.likedBy || []), userId]
          };
        }
      }
    } else {
      const commentIndex = lessonComments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        const comment = lessonComments[commentIndex];
        const userId = 'current-user';
        const hasLiked = comment.likedBy?.includes(userId);

        lessonComments[commentIndex] = {
          ...comment,
          likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
          likedBy: hasLiked
            ? comment.likedBy.filter(id => id !== userId)
            : [...(comment.likedBy || []), userId]
        };
      }
    }

    const updatedComments = {
      ...comments,
      [selectedLesson.id]: lessonComments
    };

    setComments(updatedComments);
    saveComments(updatedComments);
  };

  const handleReply = (commentId) => {
    if (!replyText.trim() || !selectedLesson) return;

    const lessonComments = [...(comments[selectedLesson.id] || [])];
    const commentIndex = lessonComments.findIndex(c => c.id === commentId);

    if (commentIndex !== -1) {
      const reply = {
        id: Date.now(),
        author: 'You',
        avatar: 'YO',
        avatarColor: 'from-blue-500 to-cyan-600',
        text: replyText,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };

      lessonComments[commentIndex].replies = [
        ...(lessonComments[commentIndex].replies || []),
        reply
      ];

      const updatedComments = {
        ...comments,
        [selectedLesson.id]: lessonComments
      };

      setComments(updatedComments);
      saveComments(updatedComments);
      setReplyText('');
      setReplyingTo(null);
      displayToast('💬 Reply posted!');
    }
  };

  const handleEditComment = (commentId, isReply = false, parentId = null) => {
    if (!editText.trim() || !selectedLesson) return;

    const lessonComments = [...(comments[selectedLesson.id] || [])];

    if (isReply && parentId) {
      const parentIndex = lessonComments.findIndex(c => c.id === parentId);
      if (parentIndex !== -1) {
        const replyIndex = lessonComments[parentIndex].replies.findIndex(r => r.id === commentId);
        if (replyIndex !== -1) {
          lessonComments[parentIndex].replies[replyIndex] = {
            ...lessonComments[parentIndex].replies[replyIndex],
            text: editText,
            edited: true
          };
        }
      }
    } else {
      const commentIndex = lessonComments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        lessonComments[commentIndex] = {
          ...lessonComments[commentIndex],
          text: editText,
          edited: true
        };
      }
    }

    const updatedComments = {
      ...comments,
      [selectedLesson.id]: lessonComments
    };

    setComments(updatedComments);
    saveComments(updatedComments);
    setEditingComment(null);
    setEditText('');
    displayToast('✏️ Comment updated!');
  };

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    if (!selectedLesson) return;

    const lessonComments = [...(comments[selectedLesson.id] || [])];

    if (isReply && parentId) {
      const parentIndex = lessonComments.findIndex(c => c.id === parentId);
      if (parentIndex !== -1) {
        lessonComments[parentIndex].replies = lessonComments[parentIndex].replies.filter(
          r => r.id !== commentId
        );
      }
    } else {
      const filteredComments = lessonComments.filter(c => c.id !== commentId);
      const updatedComments = {
        ...comments,
        [selectedLesson.id]: filteredComments
      };
      setComments(updatedComments);
      saveComments(updatedComments);
      setShowCommentMenu(null);
      displayToast('🗑️ Comment deleted!');
      return;
    }

    const updatedComments = {
      ...comments,
      [selectedLesson.id]: lessonComments
    };

    setComments(updatedComments);
    saveComments(updatedComments);
    setShowCommentMenu(null);
    displayToast('🗑️ Reply deleted!');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentProgress = calculateProgress();
  const lessonComments = selectedLesson ? (comments[selectedLesson.id] || []) : [];

  return (
    <div ref={fullscreenRef} className={`min-h-screen ${focusMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950'}`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl shadow-2xl font-semibold max-w-md text-center"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switch Warning Modal */}
      <AnimatePresence>
        {showTabWarning && focusMode && focusSettings.parentalControl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
          >
            <div className="bg-gradient-to-br from-red-500 to-orange-600 p-8 rounded-2xl max-w-md w-full text-white shadow-2xl border-4 border-yellow-400">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-8xl mb-4"
                >
                  ⚠️
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">Tab Switch Detected!</h2>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <div className="text-6xl font-bold mb-2">{focusSession.tabSwitchCount}</div>
                  <div className="text-lg">Tab Switches</div>
                  {focusSettings.strictMode && (
                    <div className="mt-4 text-sm">
                      Maximum allowed: {focusSettings.maxTabSwitches}
                    </div>
                  )}
                </div>
                <p className="text-lg mb-6">
                  {focusSettings.strictMode
                    ? 'Stay focused! Excessive tab switching will pause your session.'
                    : 'Remember to stay focused on your learning!'}
                </p>
                <button
                  onClick={() => setShowTabWarning(false)}
                  className="btn-primary bg-white text-red-600 hover:bg-gray-100 w-full py-3 text-lg font-bold"
                >
                  I Understand
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Violation Warning Modal (Strict Mode) */}
      <AnimatePresence>
        {showViolationWarning && focusMode && focusSettings.strictMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-2xl max-w-lg w-full text-white shadow-2xl border-4 border-red-400">
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-9xl mb-4"
                >
                  🚫
                </motion.div>
                <h2 className="text-4xl font-bold mb-4">Session Paused!</h2>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <div className="text-7xl font-bold mb-3 text-yellow-300">{focusSession.tabSwitchCount}</div>
                  <div className="text-xl mb-2">Tab Switches Exceeded</div>
                  <div className="text-sm opacity-90">
                    Maximum allowed: {focusSettings.maxTabSwitches}
                  </div>
                </div>
                <div className="bg-red-900/50 rounded-xl p-4 mb-6 text-left">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Parental Control Active
                  </h3>
                  <p className="text-sm opacity-90">
                    You've exceeded the maximum number of tab switches allowed in Strict Mode.
                    Your learning session has been paused. Please reset the counter or contact
                    your parent/guardian to continue.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={resetTabSwitches}
                    className="btn-primary bg-green-500 hover:bg-green-600 text-white w-full py-3 text-lg font-bold"
                  >
                    Reset Counter & Continue
                  </button>
                  <button
                    onClick={exitFocusMode}
                    className="btn-secondary bg-white/20 hover:bg-white/30 text-white w-full py-3 text-lg font-bold"
                  >
                    Exit Focus Mode
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="glass border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
                  >
                    <ArrowLeft size={20} />
                    <span className="hidden sm:inline">Back to Course</span>
                  </button>

                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>

                  <div className="hidden md:block border-l border-gray-300 dark:border-gray-600 pl-4 ml-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {course.subject}
                    </div>
                    <div className="font-bold text-gray-800 dark:text-gray-100">
                      {course.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleFocusMode}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                    title="Focus Mode (Ctrl+F)"
                  >
                    <Maximize size={20} />
                    {focusSettings.parentalControl && (
                      <Shield size={12} className="absolute -top-1 -right-1 text-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Notes"
                  >
                    <FileText size={20} />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors ${isBookmarked ? 'text-blue-600' : ''
                      }`}
                    title="Bookmark"
                  >
                    <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 size={20} />
                  </button>
                  <div className="hidden md:flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                    <Award className="text-blue-600 dark:text-blue-400" size={20} />
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {currentProgress.percentage}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode Floating Controls */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showControls ? 1 : 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="glass bg-black/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/10">
              <div className="flex items-center gap-4">
                {/* Timer */}
                {!focusSettings.hideTimer && (
                  <div className="flex items-center gap-2 text-white">
                    <Clock size={18} />
                    <span className="font-mono font-semibold">{formatTime(focusTimer)}</span>
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      disabled={showViolationWarning}
                    >
                      {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="h-6 w-px bg-white/20" />

                {/* Tab Switch Counter */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${focusSession.tabSwitchCount >= focusSettings.maxTabSwitches && focusSettings.strictMode
                  ? 'bg-red-500/20 text-red-400'
                  : focusSession.tabSwitchCount > 0
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}>
                  {focusSettings.parentalControl ? <Shield size={16} /> : <Eye size={16} />}
                  <span className="font-mono font-semibold">{focusSession.tabSwitchCount}</span>
                  <span className="text-xs">switches</span>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-white/20" />

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousLesson}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                    title="Previous (Ctrl+←)"
                  >
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <button
                    onClick={nextLesson}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                    title="Next (Ctrl+→)"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-white/20" />

                {/* Complete */}
                <button
                  onClick={markAsComplete}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors ${selectedLesson?.completed
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }`}
                >
                  {selectedLesson?.completed ? '✓ Completed' : 'Complete'}
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-white/20" />

                {/* Settings */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsHoveringSettings(true)}
                  onMouseLeave={() => setIsHoveringSettings(false)}
                >
                  <button
                    onClick={() => setShowFocusSettings(!showFocusSettings)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white relative"
                  >
                    <Settings size={18} />
                    {focusSettings.parentalControl && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black/90" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showFocusSettings && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-12 right-0 bg-gray-900 border border-white/10 rounded-xl p-4 min-w-[280px] shadow-2xl"
                      >
                        <h4 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
                          <Settings size={16} />
                          Focus Settings
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                            <span>Hide Timer</span>
                            <input
                              type="checkbox"
                              checked={focusSettings.hideTimer}
                              onChange={(e) => updateFocusSettings('hideTimer', e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                          </label>
                          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                            <span>Dim Background</span>
                            <input
                              type="checkbox"
                              checked={focusSettings.dimBackground}
                              onChange={(e) => updateFocusSettings('dimBackground', e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                          </label>
                          <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
                            <span>Auto-hide Controls</span>
                            <input
                              type="checkbox"
                              checked={focusSettings.autoHideControls}
                              onChange={(e) => updateFocusSettings('autoHideControls', e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                          </label>

                          <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="flex items-center gap-2 text-blue-400 mb-3">
                              <Shield size={16} />
                              <span className="font-semibold text-sm">Parental Controls</span>
                            </div>

                            <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer mb-3">
                              <span>Enable Monitoring</span>
                              <input
                                type="checkbox"
                                checked={focusSettings.parentalControl}
                                onChange={(e) => updateFocusSettings('parentalControl', e.target.checked)}
                                className="w-4 h-4 rounded"
                              />
                            </label>

                            {focusSettings.parentalControl && (
                              <>
                                <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer mb-3">
                                  <span>Strict Mode</span>
                                  <input
                                    type="checkbox"
                                    checked={focusSettings.strictMode}
                                    onChange={(e) => updateFocusSettings('strictMode', e.target.checked)}
                                    className="w-4 h-4 rounded"
                                  />
                                </label>

                                {focusSettings.strictMode && (
                                  <div>
                                    <label className="text-sm text-gray-300 block mb-2">
                                      Max Tab Switches: {focusSettings.maxTabSwitches}
                                    </label>
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={focusSettings.maxTabSwitches}
                                      onChange={(e) => updateFocusSettings('maxTabSwitches', parseInt(e.target.value))}
                                      className="w-full"
                                    />
                                  </div>
                                )}

                                <div className="mt-3 p-2 bg-blue-500/10 rounded text-xs text-blue-300 flex items-start gap-2">
                                  <Info size={14} className="flex-shrink-0 mt-0.5" />
                                  <span>
                                    {focusSettings.strictMode
                                      ? 'Session will pause if tab switches exceed the limit.'
                                      : 'Tab switches will be tracked and displayed.'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {focusSession.tabSwitchCount > 0 && (
                            <button
                              onClick={resetTabSwitches}
                              className="w-full mt-3 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Reset Counter
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Exit */}
                <button
                  onClick={exitFocusMode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  title="Exit Focus Mode (ESC)"
                >
                  <Minimize size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex max-w-7xl mx-auto relative">
        {/* Overlay for mobile */}
        {!focusMode && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Course Outline */}
        <AnimatePresence>
          {!focusMode && sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 glass border-r border-gray-200 dark:border-gray-700 overflow-y-auto fixed lg:sticky top-[73px] h-[calc(100vh-73px)] z-40 lg:z-0 bg-white dark:bg-gray-900"
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                  Course Content
                </h3>

                <div className="space-y-2">
                  {courseContent.weeks.map((week) => {
                    const completedInWeek = week.lessons.filter(l => l.completed).length;
                    return (
                      <div key={week.week} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleWeek(week.week)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${course.color} flex items-center justify-center text-white font-bold text-sm`}>
                              {week.week}
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-sm">{week.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {completedInWeek}/{week.lessonCount} completed
                              </div>
                            </div>
                          </div>
                          {expandedWeeks.includes(week.week) ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedWeeks.includes(week.week) && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-2 space-y-1">
                                {week.lessons.map((lesson) => (
                                  <button
                                    key={lesson.id}
                                    onClick={() => handleLessonSelect(lesson)}
                                    disabled={lesson.locked}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${selectedLesson?.id === lesson.id
                                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                      : lesson.locked
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-white dark:hover:bg-gray-700'
                                      }`}
                                  >
                                    <div className="flex-shrink-0">
                                      {lesson.locked ? (
                                        <Lock size={18} className="text-gray-400" />
                                      ) : lesson.completed ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                      ) : lesson.type === 'video' ? (
                                        <PlayCircle size={18} className="text-blue-500" />
                                      ) : lesson.type === 'quiz' ? (
                                        <HelpCircle size={18} className="text-purple-500" />
                                      ) : lesson.type === 'reading' ? (
                                        <BookOpen size={18} className="text-orange-500" />
                                      ) : (
                                        <FileText size={18} className="text-green-500" />
                                      )}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <div className="text-sm font-medium line-clamp-1">
                                        {lesson.title}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Clock size={12} />
                                        {lesson.duration}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className={`flex-1 ${focusMode ? 'p-0' : 'p-3 sm:p-4 md:p-6'} transition-all duration-300`}>
          {selectedLesson ? (
            <motion.div
              key={selectedLesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={focusMode ? 'h-screen flex items-center justify-center' : 'space-y-6'}
            >
              {/* Focus Mode Content */}
              {focusMode ? (
                <div className={`w-full max-w-5xl mx-auto p-8 ${focusSettings.dimBackground ? 'bg-gray-900/50' : ''} rounded-2xl`}>
                  <div className="card bg-white dark:bg-gray-900">
                    <div className="mb-6">
                      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{selectedLesson.title}</h1>
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <span className="text-sm">{selectedLesson.type.toUpperCase()}</span>
                        <span className="text-sm">•</span>
                        <span className="text-sm flex items-center gap-1">
                          <Clock size={14} />
                          {selectedLesson.duration}
                        </span>
                      </div>
                    </div>

                    {selectedLesson.type === 'video' && <VideoLesson lesson={selectedLesson} />}
                    {selectedLesson.type === 'reading' && <ReadingLesson lesson={selectedLesson} focusMode={true} />}
                    {selectedLesson.type === 'quiz' && <QuizLesson lesson={selectedLesson} />}
                    {selectedLesson.type === 'exercise' && <ExerciseLesson lesson={selectedLesson} />}
                  </div>
                </div>
              ) : (
                <>
                  {/* Normal Mode Content */}
                  <div className="card">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedLesson.type === 'video' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            selectedLesson.type === 'quiz' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                              selectedLesson.type === 'reading' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                            {selectedLesson.type.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock size={14} />
                            {selectedLesson.duration}
                          </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{selectedLesson.title}</h1>
                      </div>
                      {selectedLesson.completed && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg whitespace-nowrap">
                          <CheckCircle size={20} />
                          <span className="font-semibold">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lesson Content */}
                  <div className="card">
                    {selectedLesson.type === 'video' && <VideoLesson lesson={selectedLesson} />}
                    {selectedLesson.type === 'reading' && <ReadingLesson lesson={selectedLesson} />}
                    {selectedLesson.type === 'quiz' && <QuizLesson lesson={selectedLesson} />}
                    {selectedLesson.type === 'exercise' && <ExerciseLesson lesson={selectedLesson} />}
                  </div>

                  {/* Resources */}
                  <div className="card">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                      <Download className="text-blue-600 dark:text-blue-400" size={24} />
                      Resources & Downloads
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedLesson.resources.map((resource, idx) => {
                        const Icon = resource.icon;
                        return (
                          <motion.button
                            key={idx}
                            onClick={() => displayToast(`📥 Downloading ${resource.name}...`)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-sm sm:text-base">{resource.name}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      onClick={previousLesson}
                      className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <ChevronRight size={20} className="rotate-180" />
                      <span className="hidden sm:inline">Previous Lesson</span>
                      <span className="sm:hidden">Previous</span>
                    </button>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={markAsComplete}
                        className={`flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all ${selectedLesson.completed
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          : 'btn-primary'
                          }`}
                      >
                        <CheckCircle size={20} />
                        <span className="hidden sm:inline">
                          {selectedLesson.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </span>
                        <span className="sm:hidden">
                          {selectedLesson.completed ? 'Incomplete' : 'Complete'}
                        </span>
                      </button>
                      <button
                        onClick={nextLesson}
                        className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <span className="hidden sm:inline">Next Lesson</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Discussion Section */}
                  <div className="card">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
                      Discussion & Questions
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">
                        ({lessonComments.length} {lessonComments.length === 1 ? 'comment' : 'comments'})
                      </span>
                    </h3>

                    {/* New Comment Form */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          YO
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ask a question or share your thoughts..."
                            className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none resize-none"
                            rows="3"
                          />
                          <div className="flex justify-end mt-2">
                            <motion.button
                              onClick={handlePostComment}
                              disabled={!newComment.trim()}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send size={16} />
                              Post Comment
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      <AnimatePresence>
                        {lessonComments.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${comment.avatarColor} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                {comment.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="font-semibold">{comment.author}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatTimestamp(comment.timestamp)}
                                      {comment.edited && <span className="ml-2">(edited)</span>}
                                    </div>
                                  </div>
                                  {comment.author === 'You' && (
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowCommentMenu(showCommentMenu === comment.id ? null : comment.id)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                      >
                                        <MoreVertical size={16} />
                                      </button>
                                      <AnimatePresence>
                                        {showCommentMenu === comment.id && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                                          >
                                            <button
                                              onClick={() => {
                                                setEditingComment(comment.id);
                                                setEditText(comment.text);
                                                setShowCommentMenu(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                              <Edit2 size={14} />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(comment.id)}
                                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                            >
                                              <Trash2 size={14} />
                                              Delete
                                            </button>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>

                                {editingComment === comment.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none resize-none"
                                      rows="3"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditComment(comment.id)}
                                        className="btn-primary text-sm"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingComment(null);
                                          setEditText('');
                                        }}
                                        className="btn-secondary text-sm"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-600 dark:text-gray-400 mb-3 break-words">
                                    {comment.text}
                                  </p>
                                )}

                                <div className="flex items-center gap-4">
                                  <motion.button
                                    onClick={() => handleLikeComment(comment.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-1 text-sm transition-colors ${comment.likedBy?.includes('current-user')
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                                      }`}
                                  >
                                    <ThumbsUp
                                      size={16}
                                      fill={comment.likedBy?.includes('current-user') ? 'currentColor' : 'none'}
                                    />
                                    <span>{comment.likes}</span>
                                  </motion.button>
                                  <button
                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    Reply
                                  </button>
                                  {comment.replies && comment.replies.length > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                    </span>
                                  )}
                                </div>

                                {/* Reply Form */}
                                <AnimatePresence>
                                  {replyingTo === comment.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600"
                                    >
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          placeholder="Write a reply..."
                                          className="flex-1 p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none text-sm"
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                              e.preventDefault();
                                              handleReply(comment.id);
                                            }
                                          }}
                                        />
                                        <button
                                          onClick={() => handleReply(comment.id)}
                                          disabled={!replyText.trim()}
                                          className="btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                    <AnimatePresence>
                                      {comment.replies.map((reply) => (
                                        <motion.div
                                          key={reply.id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -20 }}
                                          className="flex gap-3"
                                        >
                                          <div className={`w-8 h-8 bg-gradient-to-br ${reply.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                                            {reply.avatar}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                              <div className="flex-1">
                                                <div className="font-semibold text-sm">{reply.author}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                  {formatTimestamp(reply.timestamp)}
                                                  {reply.edited && <span className="ml-2">(edited)</span>}
                                                </div>
                                              </div>
                                              {reply.author === 'You' && (
                                                <div className="relative">
                                                  <button
                                                    onClick={() => setShowCommentMenu(showCommentMenu === reply.id ? null : reply.id)}
                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                  >
                                                    <MoreVertical size={14} />
                                                  </button>
                                                  <AnimatePresence>
                                                    {showCommentMenu === reply.id && (
                                                      <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                                                      >
                                                        <button
                                                          onClick={() => {
                                                            setEditingComment(reply.id);
                                                            setEditText(reply.text);
                                                            setShowCommentMenu(null);
                                                          }}
                                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                        >
                                                          <Edit2 size={14} />
                                                          Edit
                                                        </button>
                                                        <button
                                                          onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                                        >
                                                          <Trash2 size={14} />
                                                          Delete
                                                        </button>
                                                      </motion.div>
                                                    )}
                                                  </AnimatePresence>
                                                </div>
                                              )}
                                            </div>

                                            {editingComment === reply.id ? (
                                              <div className="space-y-2">
                                                <textarea
                                                  value={editText}
                                                  onChange={(e) => setEditText(e.target.value)}
                                                  className="w-full p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none resize-none text-sm"
                                                  rows="2"
                                                />
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => handleEditComment(reply.id, true, comment.id)}
                                                    className="btn-primary text-xs px-3 py-1"
                                                  >
                                                    Save
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setEditingComment(null);
                                                      setEditText('');
                                                    }}
                                                    className="btn-secondary text-xs px-3 py-1"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
                                                  {reply.text}
                                                </p>
                                                <motion.button
                                                  onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  className={`flex items-center gap-1 text-xs transition-colors ${reply.likedBy?.includes('current-user')
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-500 hover:text-blue-600 dark:hover:text-blue-400'
                                                    }`}
                                                >
                                                  <ThumbsUp
                                                    size={14}
                                                    fill={reply.likedBy?.includes('current-user') ? 'currentColor' : 'none'}
                                                  />
                                                  <span>{reply.likes}</span>
                                                </motion.button>
                                              </>
                                            )}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {lessonComments.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                          <p>No comments yet. Be the first to start a discussion!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <div className="card text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📚</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Select a Lesson</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                Choose a lesson from the sidebar to start learning
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn-primary mt-4 lg:hidden"
              >
                Open Course Content
              </button>
            </div>
          )}
        </main>

        {/* Notes Panel */}
        <AnimatePresence>
          {!focusMode && showNotes && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-30 sm:hidden"
                onClick={() => setShowNotes(false)}
              />

              <motion.aside
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-full sm:w-96 glass border-l border-gray-200 dark:border-gray-700 fixed right-0 top-[73px] h-[calc(100vh-73px)] z-50 overflow-y-auto bg-white dark:bg-gray-900"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                      <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                      My Notes
                    </h3>
                    <button
                      onClick={() => setShowNotes(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Take notes while learning..."
                    className="w-full h-[calc(100vh-220px)] p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 outline-none resize-none text-sm sm:text-base"
                  />
                  <button
                    onClick={saveNotes}
                    className="btn-primary w-full mt-4"
                  >
                    Save Notes
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Video Lesson Component
function VideoLesson({ lesson }) {
  const [playing, setPlaying] = useState(false);

  if (!lesson || !lesson.content) {
    return <div>No content available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative bg-black rounded-xl sm:rounded-2xl overflow-hidden aspect-video">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <PlayCircle size={40} className="sm:w-12 sm:h-12 text-white" />
          </button>
        </div>
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-center gap-2 sm:gap-4">
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-full h-1.5 sm:h-2">
            <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full w-1/3" />
          </div>
          <span className="text-white text-xs sm:text-sm font-semibold">4:32 / 12:45</span>
        </div>
      </div>

      {lesson.content.keyPoints && lesson.content.keyPoints.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-xl">
          <h4 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} />
            Key Takeaways
          </h4>
          <ul className="space-y-2">
            {lesson.content.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle size={18} className="sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lesson.content.transcript && (
        <div>
          <h4 className="text-base sm:text-lg font-bold mb-3">Video Transcript</h4>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            {lesson.content.transcript}
          </p>
        </div>
      )}
    </div>
  );
}

// Reading Lesson Component
function ReadingLesson({ lesson, focusMode = false }) {
  if (!lesson || !lesson.content || !lesson.content.text) {
    return <div>No content available</div>;
  }

  return (
    <div className={`prose dark:prose-invert max-w-none ${focusMode ? 'prose-lg' : ''}`}>
      <div className="markdown-content space-y-4 text-sm sm:text-base">
        {lesson.content.text.split('\n').map((line, idx) => {
          const trimmedLine = line.trim();

          if (line.startsWith('# ')) {
            return <h1 key={idx} className={`${focusMode ? 'text-3xl md:text-4xl' : 'text-2xl sm:text-3xl'} font-bold mb-4 mt-6 ${focusMode ? 'text-gray-900 dark:text-white' : ''}`}>{line.replace('# ', '')}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={idx} className={`${focusMode ? 'text-2xl md:text-3xl' : 'text-xl sm:text-2xl'} font-bold mb-3 mt-5 ${focusMode ? 'text-gray-800 dark:text-gray-100' : ''}`}>{line.replace('## ', '')}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={idx} className={`${focusMode ? 'text-xl md:text-2xl' : 'text-lg sm:text-xl'} font-bold mb-2 mt-4 ${focusMode ? 'text-gray-700 dark:text-gray-200' : ''}`}>{line.replace('### ', '')}</h3>;
          } else if (line.startsWith('- ')) {
            return <li key={idx} className={`ml-6 list-disc ${focusMode ? 'text-gray-700 dark:text-gray-300' : ''}`}>{line.replace('- ', '')}</li>;
          } else if (trimmedLine) {
            return <p key={idx} className={`mb-4 leading-relaxed ${focusMode ? 'text-gray-700 dark:text-gray-300 text-lg' : 'text-gray-700 dark:text-gray-300'}`}>{line}</p>;
          }
          return <div key={idx}></div>;
        })}
      </div>

      {!focusMode && lesson.content.images && lesson.content.images.length > 0 && (
        <div className="my-8">
          <img
            src={lesson.content.images[0]}
            alt="Lesson illustration"
            className="rounded-xl w-full shadow-lg"
          />
        </div>
      )}

      {!focusMode && lesson.content.references && lesson.content.references.length > 0 && (
        <div className="mt-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpen size={18} className="sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            References
          </h4>
          <ul className="space-y-2">
            {lesson.content.references.map((ref, idx) => (
              <li key={idx} className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:underline cursor-pointer break-words">
                {ref}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Quiz Lesson Component
function QuizLesson({ lesson }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!lesson || !lesson.quiz || !lesson.quiz.questions) {
    return <div>No quiz available</div>;
  }

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const score = submitted
    ? lesson.quiz.questions.filter((q, idx) => answers[q.id] === q.correct).length
    : 0;

  return (
    <div className="space-y-6">
      {!submitted ? (
        <>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 sm:p-6 rounded-xl">
            <h4 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-2">
              <HelpCircle className="text-purple-600 dark:text-purple-400" size={20} />
              Quiz Instructions
            </h4>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Answer all questions to test your understanding. You can retake this quiz as many times as needed.
            </p>
          </div>

          {lesson.quiz.questions.map((question, qIdx) => (
            <div key={question.id} className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="text-sm sm:text-base font-bold mb-4">
                Question {qIdx + 1}: {question.question}
              </h4>
              <div className="space-y-2">
                {question.options.map((option, oIdx) => (
                  <label
                    key={oIdx}
                    className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={oIdx}
                      checked={answers[question.id] === oIdx}
                      onChange={() => setAnswers({ ...answers, [question.id]: oIdx })}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-sm sm:text-base">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < lesson.quiz.questions.length}
            className="btn-primary w-full py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {score === lesson.quiz.questions.length ? '🎉' : score >= lesson.quiz.questions.length / 2 ? '👍' : '📚'}
          </div>
          <h3 className="text-3xl font-bold mb-2">
            Score: {score}/{lesson.quiz.questions.length}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {score === lesson.quiz.questions.length
              ? 'Perfect! You mastered this topic!'
              : score >= lesson.quiz.questions.length / 2
                ? 'Good job! Review the material for better understanding.'
                : 'Keep practicing! Review the lesson and try again.'}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
            }}
            className="btn-secondary"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}

// Exercise Lesson Component
function ExerciseLesson({ lesson }) {
  const [solutions, setSolutions] = useState({});
  const [showSolutions, setShowSolutions] = useState({});

  if (!lesson || !lesson.content || !lesson.content.problems) {
    return <div>No exercises available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
        <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Code className="text-green-600 dark:text-green-400" size={24} />
          Practice Exercises
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          {lesson.content.description}
        </p>
      </div>

      {lesson.content.problems.map((problem) => (
        <div key={problem.id} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="font-bold mb-4">Problem {problem.id}</h4>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{problem.question}</p>

          <textarea
            value={solutions[problem.id] || ''}
            onChange={(e) => setSolutions({ ...solutions, [problem.id]: e.target.value })}
            placeholder="Write your solution here..."
            className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none mb-3"
            rows="4"
          />

          <button
            onClick={() => setShowSolutions({ ...showSolutions, [problem.id]: !showSolutions[problem.id] })}
            className="btn-secondary text-sm"
          >
            {showSolutions[problem.id] ? 'Hide' : 'Show'} Solution
          </button>

          {showSolutions[problem.id] && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h5 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb size={18} className="text-yellow-500" />
                Solution:
              </h5>
              <p className="text-gray-700 dark:text-gray-300">{problem.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}