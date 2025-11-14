"""
Seed Courses Data
Generates sample courses with realistic syllabus data.
"""

from datetime import datetime
from app_new import app, db
from app_modules.models import Course, Teacher


def seed_courses():
    """Generate comprehensive sample courses"""

    with app.app_context():
        print("🌱 Seeding courses data...")

        # Check if courses already exist
        existing_count = Course.query.count()
        if existing_count > 0:
            print(f"⚠️  {existing_count} courses already exist")
            response = input("Delete existing courses and reseed? (yes/no): ")

            if response.lower() != 'yes':
                print("❌ Seeding cancelled")
                return

            # Delete existing courses
            Course.query.delete()
            Teacher.query.delete()
            db.session.commit()
            print("🗑️  Cleared existing courses")

        # Create sample teachers
        teachers = [
            Teacher(teacher_id='T10001', email='sarah.chen@intellilearn.com', name='Dr. Sarah Chen'),
            Teacher(teacher_id='T10002', email='michael.roberts@intellilearn.com', name='Prof. Michael Roberts'),
            Teacher(teacher_id='T10003', email='emily.watson@intellilearn.com', name='Dr. Emily Watson'),
            Teacher(teacher_id='T10004', email='david.kim@intellilearn.com', name='Prof. David Kim'),
            Teacher(teacher_id='T10005', email='alex.johnson@intellilearn.com', name='Dr. Alex Johnson'),
            Teacher(teacher_id='T10006', email='jake.williams@intellilearn.com', name='Jake Williams'),
            Teacher(teacher_id='T10007', email='maria.garcia@intellilearn.com', name='Dr. Maria Garcia'),
            Teacher(teacher_id='T10008', email='james.brown@intellilearn.com', name='Prof. James Brown'),
        ]

        for teacher in teachers:
            db.session.add(teacher)

        db.session.commit()
        print(f"✅ Created {len(teachers)} teachers")

        # Sample courses data
        courses_data = [
            # Computer Science
            {
                'title': 'Advanced Machine Learning',
                'description': 'Master advanced ML algorithms, neural networks, and deep learning techniques. Build production-ready AI models.',
                'teacher_id': teachers[0].id,
                'subject': 'Computer Science',
                'category': 'computer-science',
                'level': 'Advanced',
                'duration': '12 weeks',
                'thumbnail': '🤖',
                'color': 'from-blue-500 to-indigo-600',
                'rating': 4.8,
                'students_count': 2547,
                'total_lessons': 24
            },
            {
                'title': 'Data Structures & Algorithms',
                'description': 'Essential data structures and algorithmic thinking for technical interviews and software development.',
                'teacher_id': teachers[4].id,
                'subject': 'Computer Science',
                'category': 'computer-science',
                'level': 'Intermediate',
                'duration': '14 weeks',
                'thumbnail': '🗂️',
                'color': 'from-cyan-500 to-blue-600',
                'rating': 4.9,
                'students_count': 4532,
                'total_lessons': 28
            },
            {
                'title': 'Web Development Bootcamp',
                'description': 'Full-stack web development from HTML to deployment. Build real-world applications with React, Node.js, and MongoDB.',
                'teacher_id': teachers[5].id,
                'subject': 'Computer Science',
                'category': 'computer-science',
                'level': 'Beginner',
                'duration': '20 weeks',
                'thumbnail': '🌐',
                'color': 'from-teal-500 to-green-600',
                'rating': 4.9,
                'students_count': 6789,
                'total_lessons': 45
            },
            {
                'title': 'Python Programming Masterclass',
                'description': 'From basics to advanced Python concepts. Learn data science, automation, and web development.',
                'teacher_id': teachers[4].id,
                'subject': 'Computer Science',
                'category': 'computer-science',
                'level': 'Beginner',
                'duration': '10 weeks',
                'thumbnail': '🐍',
                'color': 'from-green-500 to-teal-600',
                'rating': 4.7,
                'students_count': 5234,
                'total_lessons': 30
            },
            {
                'title': 'Cloud Computing with AWS',
                'description': 'Master Amazon Web Services. Learn EC2, S3, Lambda, and serverless architecture.',
                'teacher_id': teachers[5].id,
                'subject': 'Computer Science',
                'category': 'computer-science',
                'level': 'Intermediate',
                'duration': '8 weeks',
                'thumbnail': '☁️',
                'color': 'from-orange-500 to-red-600',
                'rating': 4.6,
                'students_count': 3421,
                'total_lessons': 20
            },

            # Mathematics
            {
                'title': 'Calculus II: Integration',
                'description': 'Advanced integration techniques and their applications. Master u-substitution, integration by parts, and more.',
                'teacher_id': teachers[3].id,
                'subject': 'Mathematics',
                'category': 'mathematics',
                'level': 'Advanced',
                'duration': '10 weeks',
                'thumbnail': '📐',
                'color': 'from-orange-500 to-red-600',
                'rating': 4.7,
                'students_count': 1956,
                'total_lessons': 20
            },
            {
                'title': 'Linear Algebra for Data Science',
                'description': 'Essential linear algebra concepts for machine learning and data science applications.',
                'teacher_id': teachers[3].id,
                'subject': 'Mathematics',
                'category': 'mathematics',
                'level': 'Intermediate',
                'duration': '8 weeks',
                'thumbnail': '🔢',
                'color': 'from-purple-500 to-pink-600',
                'rating': 4.8,
                'students_count': 2876,
                'total_lessons': 18
            },
            {
                'title': 'Statistics & Probability',
                'description': 'From basic probability to advanced statistical inference. Learn hypothesis testing and regression.',
                'teacher_id': teachers[3].id,
                'subject': 'Mathematics',
                'category': 'mathematics',
                'level': 'Intermediate',
                'duration': '12 weeks',
                'thumbnail': '📊',
                'color': 'from-green-500 to-emerald-600',
                'rating': 4.6,
                'students_count': 3145,
                'total_lessons': 24
            },

            # Science
            {
                'title': 'Organic Chemistry Fundamentals',
                'description': 'Comprehensive guide to organic chemistry reactions and mechanisms. Master functional groups and synthesis.',
                'teacher_id': teachers[1].id,
                'subject': 'Chemistry',
                'category': 'science',
                'level': 'Intermediate',
                'duration': '10 weeks',
                'thumbnail': '🧪',
                'color': 'from-green-500 to-emerald-600',
                'rating': 4.6,
                'students_count': 1823,
                'total_lessons': 18
            },
            {
                'title': "Physics: Mechanics & Motion",
                'description': "Classical mechanics from Newton's laws to energy conservation. Solve real-world physics problems.",
                'teacher_id': teachers[6].id,
                'subject': 'Physics',
                'category': 'science',
                'level': 'Intermediate',
                'duration': '12 weeks',
                'thumbnail': '⚛️',
                'color': 'from-blue-500 to-purple-600',
                'rating': 4.7,
                'students_count': 2134,
                'total_lessons': 22
            },
            {
                'title': 'Biology: Cell Structure & Function',
                'description': 'Deep dive into cellular biology. Learn about DNA, proteins, and metabolic pathways.',
                'teacher_id': teachers[1].id,
                'subject': 'Biology',
                'category': 'science',
                'level': 'Beginner',
                'duration': '10 weeks',
                'thumbnail': '🧬',
                'color': 'from-green-500 to-teal-600',
                'rating': 4.8,
                'students_count': 2945,
                'total_lessons': 20
            },

            # History
            {
                'title': 'World History: Renaissance Era',
                'description': 'Explore the cultural and artistic revolution of the Renaissance period. From da Vinci to Michelangelo.',
                'teacher_id': teachers[2].id,
                'subject': 'History',
                'category': 'history',
                'level': 'Intermediate',
                'duration': '8 weeks',
                'thumbnail': '📜',
                'color': 'from-purple-500 to-pink-600',
                'rating': 4.9,
                'students_count': 3421,
                'total_lessons': 15
            },
            {
                'title': 'Ancient Civilizations',
                'description': 'Journey through ancient Egypt, Greece, and Rome. Discover the foundations of modern society.',
                'teacher_id': teachers[2].id,
                'subject': 'History',
                'category': 'history',
                'level': 'Beginner',
                'duration': '10 weeks',
                'thumbnail': '🏛️',
                'color': 'from-yellow-500 to-orange-600',
                'rating': 4.7,
                'students_count': 2678,
                'total_lessons': 18
            },
            {
                'title': 'World War II: Complete History',
                'description': 'Comprehensive study of WWII from causes to consequences. Understand the global impact.',
                'teacher_id': teachers[7].id,
                'subject': 'History',
                'category': 'history',
                'level': 'Intermediate',
                'duration': '12 weeks',
                'thumbnail': '🎖️',
                'color': 'from-red-500 to-pink-600',
                'rating': 4.8,
                'students_count': 3892,
                'total_lessons': 24
            },

            # Languages
            {
                'title': 'Spanish for Beginners',
                'description': 'Start your Spanish journey. Learn grammar, vocabulary, and conversational skills from day one.',
                'teacher_id': teachers[6].id,
                'subject': 'Spanish',
                'category': 'language',
                'level': 'Beginner',
                'duration': '16 weeks',
                'thumbnail': '🗣️',
                'color': 'from-red-500 to-orange-600',
                'rating': 4.9,
                'students_count': 4567,
                'total_lessons': 32
            },
            {
                'title': 'French Language & Culture',
                'description': 'Immersive French learning experience. Master grammar, pronunciation, and cultural context.',
                'teacher_id': teachers[6].id,
                'subject': 'French',
                'category': 'language',
                'level': 'Beginner',
                'duration': '16 weeks',
                'thumbnail': '🇫🇷',
                'color': 'from-blue-500 to-indigo-600',
                'rating': 4.7,
                'students_count': 3234,
                'total_lessons': 32
            },
            {
                'title': 'Japanese: Reading & Writing',
                'description': 'Learn Hiragana, Katakana, and Kanji. Build strong foundation in Japanese writing systems.',
                'teacher_id': teachers[7].id,
                'subject': 'Japanese',
                'category': 'language',
                'level': 'Beginner',
                'duration': '20 weeks',
                'thumbnail': '🇯🇵',
                'color': 'from-pink-500 to-red-600',
                'rating': 4.8,
                'students_count': 2891,
                'total_lessons': 40
            },

            # Business & Economics
            {
                'title': 'Financial Accounting Basics',
                'description': 'Understanding financial statements, balance sheets, and income statements. Essential for business.',
                'teacher_id': teachers[7].id,
                'subject': 'Business',
                'category': 'business',
                'level': 'Beginner',
                'duration': '8 weeks',
                'thumbnail': '💼',
                'color': 'from-green-500 to-teal-600',
                'rating': 4.6,
                'students_count': 2345,
                'total_lessons': 16
            },
            {
                'title': 'Digital Marketing Strategy',
                'description': 'Modern marketing techniques including SEO, social media, and content marketing strategies.',
                'teacher_id': teachers[5].id,
                'subject': 'Business',
                'category': 'business',
                'level': 'Intermediate',
                'duration': '10 weeks',
                'thumbnail': '📱',
                'color': 'from-purple-500 to-pink-600',
                'rating': 4.8,
                'students_count': 4123,
                'total_lessons': 20
            },
            {
                'title': 'Microeconomics Principles',
                'description': 'Supply and demand, market structures, and economic decision-making for individuals and firms.',
                'teacher_id': teachers[7].id,
                'subject': 'Economics',
                'category': 'business',
                'level': 'Intermediate',
                'duration': '12 weeks',
                'thumbnail': '💰',
                'color': 'from-yellow-500 to-orange-600',
                'rating': 4.7,
                'students_count': 2678,
                'total_lessons': 22
            },
        ]

        # Create courses
        created_courses = []
        for course_data in courses_data:
            course = Course(**course_data)
            db.session.add(course)
            created_courses.append(course)

        db.session.commit()
        print(f"✅ Created {len(created_courses)} courses")

        # Print summary by category
        print("\n📊 Courses by Category:")
        categories = {}

        for course in created_courses:
            categories.setdefault(course.category, []).append(course.title)

        for category, course_titles in categories.items():
            print(f"   {category}: {len(course_titles)} courses")
            for title in course_titles:
                print(f"      - {title}")

        print("\n✅ Database seeding completed successfully!")
        print(f"📚 Total courses: {len(created_courses)}")
        print(f"👨‍🏫 Total teachers: {len(teachers)}")
        print("\n🚀 Ready to use! Start your backend and frontend to see the courses.")


if __name__ == '__main__':
    seed_courses()
