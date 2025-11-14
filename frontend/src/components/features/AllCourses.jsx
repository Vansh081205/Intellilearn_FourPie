import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Users,
    Star,
    TrendingUp,
    Filter,
    Search,
    X,
    PlayCircle,
    Award,
    CheckCircle,
    ArrowLeft,
    HelpCircle,
    Download
} from 'lucide-react';
import CourseContent from './CourseContent';

// LocalStorage keys
const COURSES_STORAGE_KEY = 'intellilearn_courses_data';
const COURSE_PROGRESS_KEY = 'intellilearn_course_data';

// Load course progress from localStorage
function loadAllCoursesData() {
    try {
        const data = localStorage.getItem(COURSES_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading courses data:', error);
        return null;
    }
}

// Save course progress to localStorage
function saveAllCoursesData(courses) {
    try {
        localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    } catch (error) {
        console.error('Error saving courses data:', error);
    }
}

export default function AllCourses({ onNavigate, selectedCourse: initialSelectedCourse }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(initialSelectedCourse);
    const [viewMode, setViewMode] = useState(initialSelectedCourse ? 'content' : 'list');
    const [showCertificate, setShowCertificate] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Default course data
    const defaultCourses = [
        {
            id: 1,
            title: "Advanced Machine Learning",
            subject: "Computer Science",
            category: "computer-science",
            description: "Master advanced ML algorithms, neural networks, and deep learning techniques",
            instructor: "Dr. Sarah Chen",
            thumbnail: "🤖",
            color: "from-blue-500 to-indigo-600",
            totalLessons: 24,
            completedLessons: 16,
            duration: "12 weeks",
            level: "Advanced",
            rating: 4.8,
            students: 2547,
            progress: 68,
            lastAccessed: "2 hours ago",
            nextLesson: "Neural Networks Basics",
            enrolled: true,
            syllabus: [
                { week: 1, title: "Introduction to ML", lessons: 4, completed: 4 },
                { week: 2, title: "Supervised Learning", lessons: 5, completed: 5 },
                { week: 3, title: "Neural Networks", lessons: 6, completed: 4 },
                { week: 4, title: "Deep Learning", lessons: 5, completed: 3 },
                { week: 5, title: "Advanced Topics", lessons: 4, completed: 0 },
            ],
            skills: ["Python", "TensorFlow", "Neural Networks", "Deep Learning"]
        },
        {
            id: 2,
            title: "Organic Chemistry Fundamentals",
            subject: "Chemistry",
            category: "science",
            description: "Comprehensive guide to organic chemistry reactions and mechanisms",
            instructor: "Prof. Michael Roberts",
            thumbnail: "🧪",
            color: "from-green-500 to-emerald-600",
            totalLessons: 18,
            completedLessons: 8,
            duration: "10 weeks",
            level: "Intermediate",
            rating: 4.6,
            students: 1823,
            progress: 45,
            lastAccessed: "1 day ago",
            nextLesson: "Reaction Mechanisms",
            enrolled: true,
            syllabus: [
                { week: 1, title: "Basics of Organic Chemistry", lessons: 4, completed: 4 },
                { week: 2, title: "Functional Groups", lessons: 5, completed: 4 },
                { week: 3, title: "Reaction Mechanisms", lessons: 4, completed: 0 },
                { week: 4, title: "Synthesis", lessons: 5, completed: 0 },
            ],
            skills: ["Organic Chemistry", "Lab Techniques", "Molecular Structure"]
        },
        {
            id: 3,
            title: "World History: Renaissance Era",
            subject: "History",
            category: "history",
            description: "Explore the cultural and artistic revolution of the Renaissance period",
            instructor: "Dr. Emily Watson",
            thumbnail: "📜",
            color: "from-purple-500 to-pink-600",
            totalLessons: 15,
            completedLessons: 12,
            duration: "8 weeks",
            level: "Intermediate",
            rating: 4.9,
            students: 3421,
            progress: 82,
            lastAccessed: "3 hours ago",
            nextLesson: "The Medici Family",
            enrolled: true,
            syllabus: [
                { week: 1, title: "Dawn of Renaissance", lessons: 3, completed: 3 },
                { week: 2, title: "Art & Architecture", lessons: 4, completed: 4 },
                { week: 3, title: "The Italian States", lessons: 4, completed: 3 },
                { week: 4, title: "Legacy & Impact", lessons: 4, completed: 2 },
            ],
            skills: ["Historical Analysis", "Art History", "Cultural Studies"]
        },
        {
            id: 4,
            title: "Calculus II: Integration",
            subject: "Mathematics",
            category: "mathematics",
            description: "Advanced integration techniques and their applications",
            instructor: "Prof. David Kim",
            thumbnail: "📐",
            color: "from-orange-500 to-red-600",
            totalLessons: 20,
            completedLessons: 7,
            duration: "10 weeks",
            level: "Advanced",
            rating: 4.7,
            students: 1956,
            progress: 34,
            lastAccessed: "5 days ago",
            nextLesson: "Integration by Parts",
            enrolled: true,
            syllabus: [
                { week: 1, title: "Integration Fundamentals", lessons: 4, completed: 4 },
                { week: 2, title: "Advanced Techniques", lessons: 5, completed: 3 },
                { week: 3, title: "Applications", lessons: 6, completed: 0 },
                { week: 4, title: "Series & Sequences", lessons: 5, completed: 0 },
            ],
            skills: ["Calculus", "Mathematical Analysis", "Problem Solving"]
        },
        {
            id: 5,
            title: "Data Structures & Algorithms",
            subject: "Computer Science",
            category: "computer-science",
            description: "Essential data structures and algorithmic thinking for software engineers",
            instructor: "Dr. Alex Johnson",
            thumbnail: "🗂️",
            color: "from-cyan-500 to-blue-600",
            totalLessons: 28,
            completedLessons: 0,
            duration: "14 weeks",
            level: "Intermediate",
            rating: 4.9,
            students: 4532,
            progress: 0,
            enrolled: false,
            syllabus: [
                { week: 1, title: "Arrays & Lists", lessons: 5, completed: 0 },
                { week: 2, title: "Trees & Graphs", lessons: 6, completed: 0 },
                { week: 3, title: "Sorting & Searching", lessons: 5, completed: 0 },
                { week: 4, title: "Dynamic Programming", lessons: 6, completed: 0 },
                { week: 5, title: "Advanced Algorithms", lessons: 6, completed: 0 },
            ],
            skills: ["Data Structures", "Algorithms", "Problem Solving", "Coding"]
        },
        {
            id: 6,
            title: "Quantum Physics Introduction",
            subject: "Physics",
            category: "science",
            description: "Dive into the fascinating world of quantum mechanics",
            instructor: "Prof. Lisa Anderson",
            thumbnail: "⚛️",
            color: "from-violet-500 to-purple-600",
            totalLessons: 16,
            completedLessons: 0,
            duration: "12 weeks",
            level: "Advanced",
            rating: 4.8,
            students: 2134,
            progress: 0,
            enrolled: false,
            syllabus: [
                { week: 1, title: "Quantum Basics", lessons: 4, completed: 0 },
                { week: 2, title: "Wave-Particle Duality", lessons: 4, completed: 0 },
                { week: 3, title: "Quantum States", lessons: 4, completed: 0 },
                { week: 4, title: "Applications", lessons: 4, completed: 0 },
            ],
            skills: ["Quantum Mechanics", "Physics", "Mathematical Physics"]
        },
        {
            id: 7,
            title: "Spanish for Beginners",
            subject: "Language",
            category: "language",
            description: "Learn Spanish from scratch with interactive lessons",
            instructor: "María González",
            thumbnail: "🇪🇸",
            color: "from-red-500 to-yellow-500",
            totalLessons: 30,
            completedLessons: 0,
            duration: "16 weeks",
            level: "Beginner",
            rating: 4.7,
            students: 5234,
            progress: 0,
            enrolled: false,
            syllabus: [
                { week: 1, title: "Basics & Pronunciation", lessons: 6, completed: 0 },
                { week: 2, title: "Grammar Fundamentals", lessons: 6, completed: 0 },
                { week: 3, title: "Conversations", lessons: 6, completed: 0 },
                { week: 4, title: "Advanced Grammar", lessons: 6, completed: 0 },
                { week: 5, title: "Fluency Practice", lessons: 6, completed: 0 },
            ],
            skills: ["Spanish Language", "Conversation", "Grammar", "Vocabulary"]
        },
        {
            id: 8,
            title: "Web Development Bootcamp",
            subject: "Computer Science",
            category: "computer-science",
            description: "Full-stack web development from HTML to deployment",
            instructor: "Jake Williams",
            thumbnail: "🌐",
            color: "from-teal-500 to-green-600",
            totalLessons: 45,
            completedLessons: 0,
            duration: "20 weeks",
            level: "Beginner",
            rating: 4.9,
            students: 6789,
            progress: 0,
            enrolled: false,
            syllabus: [
                { week: 1, title: "HTML & CSS", lessons: 8, completed: 0 },
                { week: 2, title: "JavaScript Basics", lessons: 10, completed: 0 },
                { week: 3, title: "React & Frontend", lessons: 12, completed: 0 },
                { week: 4, title: "Backend & APIs", lessons: 10, completed: 0 },
                { week: 5, title: "Deployment", lessons: 5, completed: 0 },
            ],
            skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Full Stack"]
        },
    ];

    // Stateful course data - load from localStorage or use defaults
    const [allCourses, setAllCourses] = useState(() => {
        const savedCourses = loadAllCoursesData();
        return savedCourses || defaultCourses;
    });

    // Save courses to localStorage whenever they change
    useEffect(() => {
        saveAllCoursesData(allCourses);
    }, [allCourses]);

    // Sync with external selected course
    useEffect(() => {
        if (initialSelectedCourse) {
            // Find the course in our state to get the latest progress
            const updatedCourse = allCourses.find(c => c.id === initialSelectedCourse.id);
            setSelectedCourse(updatedCourse || initialSelectedCourse);
            setViewMode('content');
        } else {
            setViewMode('list');
        }
    }, [initialSelectedCourse, allCourses]);

    const categories = [
        { id: 'all', name: 'All Courses', icon: '📚' },
        { id: 'computer-science', name: 'Computer Science', icon: '💻' },
        { id: 'mathematics', name: 'Mathematics', icon: '📐' },
        { id: 'science', name: 'Science', icon: '🔬' },
        { id: 'history', name: 'History', icon: '📜' },
        { id: 'language', name: 'Languages', icon: '🗣️' },
    ];

    const filteredCourses = allCourses.filter(course => {
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const enrolledCourses = filteredCourses.filter(c => c.enrolled);
    const availableCourses = filteredCourses.filter(c => !c.enrolled);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleEnrollCourse = (courseId) => {
        setAllCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === courseId
                    ? { ...course, enrolled: true, lastAccessed: 'Just now' }
                    : course
            )
        );
        showToast('🎉 Successfully enrolled in course!');
    };

    const handleProgressUpdate = (courseId, newProgress, completedLessons) => {
        setAllCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === courseId
                    ? {
                        ...course,
                        progress: newProgress,
                        completedLessons: completedLessons,
                        lastAccessed: 'Just now'
                    }
                    : course
            )
        );

        // Update selected course if it's the one being updated
        if (selectedCourse && selectedCourse.id === courseId) {
            setSelectedCourse(prev => ({
                ...prev,
                progress: newProgress,
                completedLessons: completedLessons,
                lastAccessed: 'Just now'
            }));
        }
    };

    // Show practice quiz
    if (viewMode === 'quiz' && selectedCourse) {
        const quiz = practiceQuizzes[selectedCourse.id];
        return (
            <PracticeQuiz
                quiz={quiz}
                onBack={() => {
                    setViewMode('content');
                }}
            />
        );
    }

    // Show course content viewer
    if (viewMode === 'content' && selectedCourse) {
        return (
            <CourseContent
                course={selectedCourse}
                onBack={() => {
                    setViewMode('detail');
                }}
                onNavigate={onNavigate}
                onPracticeQuiz={() => setViewMode('quiz')}
                onProgressUpdate={handleProgressUpdate}
            />
        );
    }

    // Show course detail
    if (viewMode === 'detail' && selectedCourse) {
        return (
            <CourseDetail
                course={selectedCourse}
                onBack={() => {
                    setSelectedCourse(null);
                    setViewMode('list');
                }}
                onStartLearning={() => {
                    setViewMode('content');
                }}
                onEnroll={() => handleEnrollCourse(selectedCourse.id)}
                showCertificate={showCertificate}
                setShowCertificate={setShowCertificate}
                showToast={showToast}
            />
        );
    }

    return (
        <div className="space-y-8">
            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl shadow-2xl font-semibold max-w-md text-center"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-5xl font-bold mb-4">
                    <span className="gradient-text">Explore Courses</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Discover your next learning adventure with our comprehensive course library
                </p>
            </motion.div>

            {/* Search and Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Filter Icon */}
                    <button
                        onClick={() => showToast('🔍 Advanced filters coming soon!')}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-colors font-semibold"
                    >
                        <Filter size={20} />
                        <span className="hidden md:inline">Filters</span>
                    </button>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-3 mt-4">
                    {categories.map((category) => (
                        <motion.button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Enrolled Courses Section */}
            {enrolledCourses.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">
                            <span className="gradient-text">My Courses</span>
                        </h2>
                        <span className="text-gray-600 dark:text-gray-400">
                            {enrolledCourses.length} enrolled
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map((course, idx) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                idx={idx}
                                onClick={() => {
                                    setSelectedCourse(course);
                                    setViewMode('detail');
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Available Courses Section */}
            {availableCourses.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold">
                            <span className="gradient-text">Available Courses</span>
                        </h2>
                        <span className="text-gray-600 dark:text-gray-400">
                            {availableCourses.length} courses
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableCourses.map((course, idx) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                idx={idx + enrolledCourses.length}
                                onClick={() => {
                                    setSelectedCourse(course);
                                    setViewMode('detail');
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {filteredCourses.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card text-center py-12"
                >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold mb-2">No courses found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Try adjusting your search or filter criteria
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                        }}
                        className="btn-primary"
                    >
                        Clear Filters
                    </button>
                </motion.div>
            )}
        </div>
    );
}

function CourseCard({ course, idx, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8 }}
            onClick={onClick}
            className="card cursor-pointer overflow-hidden group"
        >
            {/* Course Thumbnail */}
            <div className={`relative bg-gradient-to-br ${course.color} p-6 text-center`}>
                <div className="text-6xl mb-2">{course.thumbnail}</div>
                {course.enrolled && course.progress > 0 && (
                    <div className="absolute top-3 right-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-semibold">
                            {course.progress}%
                        </div>
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-semibold">
                        {course.level}
                    </div>
                </div>
            </div>

            {/* Course Info */}
            <div className="p-5">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {course.subject}
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {course.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                </p>

                {/* Course Meta */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.totalLessons} lessons</span>
                    </div>
                </div>

                {/* Progress Bar for Enrolled Courses */}
                {course.enrolled && course.progress > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>{course.completedLessons} of {course.totalLessons} completed</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                className={`h-full bg-gradient-to-r ${course.color} rounded-full`}
                            />
                        </div>
                    </div>
                )}

                {/* Instructor */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {course.instructor}
                    </div>
                    {course.enrolled ? (
                        <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Continue
                            <PlayCircle className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Enroll
                            <TrendingUp className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function CourseDetail({ course, onBack, onStartLearning, onEnroll, showCertificate, setShowCertificate, showToast }) {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold"
            >
                <ArrowLeft size={20} />
                Back to Courses
            </button>

            {/* Hero Section */}
            <div className="card overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Course Image and Quick Info */}
                    <div>
                        <div className={`bg-gradient-to-br ${course.color} p-12 rounded-2xl text-center mb-6`}>
                            <div className="text-9xl mb-4">{course.thumbnail}</div>
                            <div className="flex gap-2 justify-center">
                                <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold">
                                    {course.level}
                                </span>
                                <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold">
                                    {course.duration}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    {course.rating}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                    {course.students.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                                    {course.totalLessons}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                                    {course.progress}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Course Details */}
                    <div>
                        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            {course.subject}
                        </div>
                        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                            {course.description}
                        </p>

                        {/* Instructor */}
                        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {course.instructor.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Instructor</div>
                                <div className="font-semibold">{course.instructor}</div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-6">
                            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                                What you'll learn:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {course.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-4">
                            {course.enrolled ? (
                                <>
                                    <button
                                        onClick={onStartLearning}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        <PlayCircle size={20} />
                                        Continue Learning
                                    </button>
                                    {course.progress >= 100 && (
                                        <button
                                            onClick={() => setShowCertificate(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-yellow-400 dark:border-orange-500 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all flex items-center gap-2"
                                        >
                                            <Award size={20} />
                                            Certificate
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onEnroll}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        <TrendingUp size={20} />
                                        Enroll Now
                                    </button>
                                    <button
                                        onClick={() => showToast('🎬 Course preview coming soon!')}
                                        className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:border-blue-500 transition-colors"
                                    >
                                        Preview
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                    {['overview', 'syllabus', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 font-semibold capitalize transition-colors relative ${activeTab === tab
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-4">Course Overview</h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                        {course.description} This comprehensive course will take you from fundamentals to advanced concepts,
                                        with hands-on projects and real-world applications. You'll learn from industry experts and gain
                                        practical skills that you can apply immediately.
                                    </p>
                                </div>

                                {course.enrolled && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
                                        <h4 className="text-lg font-bold mb-3">Your Progress</h4>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Overall Progress</span>
                                                    <span className="font-bold">{course.progress}%</span>
                                                </div>
                                                <div className="w-full bg-white dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${course.progress}%` }}
                                                        className={`h-full bg-gradient-to-r ${course.color}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <div className="text-2xl font-bold text-blue-600">{course.completedLessons}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {course.totalLessons - course.completedLessons}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {Math.ceil((course.totalLessons - course.completedLessons) / 3)}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">Weeks Left</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'syllabus' && (
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold mb-6">Course Syllabus</h3>
                                {course.syllabus.map((week, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${course.color} flex items-center justify-center text-white font-bold`}>
                                                    {week.week}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{week.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {week.lessons} lessons
                                                    </p>
                                                </div>
                                            </div>
                                            {week.completed === week.lessons ? (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <CheckCircle size={20} />
                                                    <span className="font-semibold">Completed</span>
                                                </div>
                                            ) : week.completed > 0 ? (
                                                <div className="text-blue-600 dark:text-blue-400 font-semibold">
                                                    {week.completed}/{week.lessons}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 font-semibold">Not started</div>
                                            )}
                                        </div>
                                        {week.completed > 0 && week.completed < week.lessons && (
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${course.color}`}
                                                    style={{ width: `${(week.completed / week.lessons) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="text-center">
                                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                            {course.rating}
                                        </div>
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={20}
                                                    className={`${i < Math.floor(course.rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {course.students} ratings
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map((stars) => (
                                            <div key={stars} className="flex items-center gap-3">
                                                <div className="text-sm w-12">{stars} ⭐</div>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-400 h-2 rounded-full"
                                                        style={{ width: `${Math.random() * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sample Reviews */}
                                {[1, 2, 3].map((review) => (
                                    <div key={review} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                U
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-bold">User {review}</div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={16}
                                                                className="fill-yellow-400 text-yellow-400"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                    Excellent course! The instructor explains complex concepts in a very understandable way.
                                                    The hands-on projects really helped solidify my understanding.
                                                </p>
                                                <div className="text-sm text-gray-500 dark:text-gray-500">2 weeks ago</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Certificate Modal */}
            <AnimatePresence>
                {showCertificate && course && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
                            onClick={() => setShowCertificate(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowCertificate(false)}
                        >
                            <div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowCertificate(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>

                                {/* Certificate Content */}
                                <div className="certificate-content border-8 border-double border-yellow-500 dark:border-yellow-600 p-8 rounded-xl bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <div className="text-6xl mb-4">🏆</div>
                                        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                                            Certificate of Completion
                                        </h2>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                                            IntelliLearn Academy
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="text-center space-y-6 mb-8">
                                        <p className="text-lg text-gray-700 dark:text-gray-300">
                                            This is to certify that
                                        </p>
                                        <div className="text-4xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2 inline-block px-8">
                                            John Doe
                                        </div>
                                        <p className="text-lg text-gray-700 dark:text-gray-300">
                                            has successfully completed the course
                                        </p>
                                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {course.title}
                                        </div>
                                        <div className="flex items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Clock size={18} />
                                                <span>{course.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={18} />
                                                <span>{course.totalLessons} Lessons</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-end justify-between pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Instructor</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{course.instructor}</div>
                                            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 w-40"></div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date Completed</div>
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Certificate ID</div>
                                            <div className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                                                IL-{course.id}-{Date.now().toString(36).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Button */}
                                <div className="flex justify-center mt-6 gap-4">
                                    <button
                                        onClick={() => {
                                            const certificateHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Georgia', serif; margin: 40px; background: linear-gradient(135deg, #fef3c7 0%, #ffffff 50%, #fed7aa 100%); }
    .certificate { border: 15px double #eab308; padding: 60px; text-align: center; background: white; max-width: 800px; margin: 0 auto; }
    .trophy { font-size: 80px; margin-bottom: 20px; }
    .title { font-size: 48px; color: #d97706; font-weight: bold; margin: 20px 0; }
    .subtitle { font-size: 14px; color: #6b7280; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px; }
    .body-text { font-size: 20px; color: #374151; margin: 20px 0; }
    .name { font-size: 44px; font-weight: bold; border-bottom: 2px solid #d1d5db; display: inline-block; padding: 10px 40px; margin: 20px 0; }
    .course-title { font-size: 36px; color: #2563eb; font-weight: bold; margin: 20px 0; }
    .details { display: flex; justify-content: center; gap: 40px; margin: 30px 0; font-size: 16px; color: #6b7280; }
    .footer { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 30px; border-top: 2px solid #e5e7eb; }
    .footer-section { text-align: center; }
    .footer-label { font-size: 12px; color: #9ca3af; margin-bottom: 5px; }
    .footer-value { font-size: 16px; font-weight: bold; color: #111827; }
    .signature-line { border-top: 1px solid #d1d5db; width: 200px; margin: 10px auto 0; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="trophy">🏆</div>
    <div class="title">Certificate of Completion</div>
    <div class="subtitle">IntelliLearn Academy</div>
    <div class="body-text">This is to certify that</div>
    <div class="name">John Doe</div>
    <div class="body-text">has successfully completed the course</div>
    <div class="course-title">${course.title}</div>
    <div class="details">
      <div>⏱️ ${course.duration}</div>
      <div>📚 ${course.totalLessons} Lessons</div>
    </div>
    <div class="footer">
      <div class="footer-section">
        <div class="footer-label">Instructor</div>
        <div class="footer-value">${course.instructor}</div>
        <div class="signature-line"></div>
      </div>
      <div class="footer-section">
        <div class="footer-label">Date Completed</div>
        <div class="footer-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="footer-section">
        <div class="footer-label">Certificate ID</div>
        <div class="footer-value">IL-${course.id}-${Date.now().toString(36).toUpperCase()}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

                                            const blob = new Blob([certificateHTML], { type: 'text/html' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `Certificate_${course.title.replace(/\s+/g, '_')}.html`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            URL.revokeObjectURL(url);

                                            showToast('📥 Certificate downloaded! Open the HTML file and use Print to PDF.');
                                        }}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <Download size={20} />
                                        Download Certificate
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const shareData = {
                                                title: '🎓 Certificate Achievement!',
                                                text: `I just completed "${course.title}" on IntelliLearn! 🎉\n\nCourse: ${course.title}\nInstructor: ${course.instructor}\nDuration: ${course.duration}\n\n#IntelliLearn #OnlineLearning #Achievement`,
                                            };

                                            try {
                                                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                                    await navigator.share(shareData);
                                                    showToast('🎉 Shared successfully!');
                                                } else {
                                                    const textToCopy = `🎓 I just completed "${course.title}" on IntelliLearn! 🎉\n\nCourse: ${course.title}\nInstructor: ${course.instructor}\nDuration: ${course.duration}\n\n#IntelliLearn #OnlineLearning #Achievement`;
                                                    await navigator.clipboard.writeText(textToCopy);
                                                    showToast('📋 Achievement copied to clipboard! Paste it on social media.');
                                                }
                                            } catch (error) {
                                                if (error.name !== 'AbortError') {
                                                    console.error('Error sharing:', error);
                                                }
                                            }
                                        }}
                                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <Award size={20} />
                                        Share Achievement
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}