import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock
} from 'lucide-react';

// Load courses from localStorage
const COURSES_STORAGE_KEY = 'intellilearn_courses_data';

function loadCoursesFromStorage() {
  try {
    const data = localStorage.getItem(COURSES_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading courses:', error);
    return null;
  }
}

export default function ContinueLearning({ onNavigate }) {
  // Load courses from localStorage or use empty array
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Load courses from localStorage
    const savedCourses = loadCoursesFromStorage();
    if (savedCourses) {
      setCourses(savedCourses);
    }

    // Set up an interval to refresh courses from localStorage
    const interval = setInterval(() => {
      const refreshedCourses = loadCoursesFromStorage();
      if (refreshedCourses) {
        setCourses(refreshedCourses);
      }
    }, 1000); // Check every second for updates

    return () => clearInterval(interval);
  }, []);

  // Filter only enrolled courses
  const enrolledCourses = courses.filter(course => course.enrolled);

  // If no enrolled courses, don't render anything
  if (enrolledCourses.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="gradient-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Continue Learning
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Pick up where you left off
          </p>
        </div>
        <button
          onClick={() => onNavigate('courses')}
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {enrolledCourses.slice(0, 4).map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('courses', course)}
            className="card cursor-pointer overflow-hidden group"
          >
            {/* Course Thumbnail with Gradient */}
            <div className={`relative bg-gradient-to-br ${course.color} p-6 text-center`}>
              <div className="text-6xl mb-2">{course.thumbnail}</div>
              <div className="absolute top-3 right-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-semibold">
                  {course.progress}%
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                {course.subject}
              </div>

              <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {course.title}
              </h3>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>{course.completedLessons} of {course.totalLessons} lessons</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                    className={`h-full bg-gradient-to-r ${course.color} rounded-full`}
                  />
                </div>
              </div>

              {/* Next Lesson */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Next lesson:
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {course.nextLesson}
                </div>
              </div>

              {/* Footer with Last Accessed */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  {course.lastAccessed}
                </div>
                <button className="text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Resume
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}