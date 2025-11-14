"""
Course Database Seeder Script
Populates the database with initial course data
Runs only once - checks for existing data before inserting
"""
from app import app, db
from models.course import Course, CourseEnrollment
from models.user import User, Teacher
from datetime import datetime
import sys
def check_if_already_seeded():
    """Check if courses already exist in database"""
    course_count = Course.query.count()
    if course_count > 0:
        print(f"✅ Database already seeded with {course_count} courses.")
        print("Skipping seed operation to prevent duplicates.")
        return True
    return False
def create_teachers():
    """Create sample teachers if they don't exist"""
    teachers_data = [
        {
            'user_id': 'teacher_ml_001',
            'name': 'Dr. Sarah Johnson',
            'email': 'sarah.johnson@university.edu',
            'expertise': 'Machine Learning, AI'
        },
        {
            'user_id': 'teacher_chem_001',
            'name': 'Prof. Michael Chen',
            'email': 'michael.chen@university.edu',
            'expertise': 'Organic Chemistry'
        },
        {
            'user_id': 'teacher_hist_001',
            'name': 'Dr. Emily Martinez',
            'email': 'emily.martinez@university.edu',
            'expertise': 'Renaissance History'
        },
        {
            'user_id': 'teacher_math_001',
            'name': 'Prof. David Williams',
            'email': 'david.williams@university.edu',
            'expertise': 'Calculus, Mathematics'
        }
    ]
    
    teachers = []
    for teacher_data in teachers_data:
        # Check if teacher already exists
        teacher = Teacher.query.filter_by(user_id=teacher_data['user_id']).first()
        if not teacher:
            # Create user first if needed
            user = User.query.filter_by(id=teacher_data['user_id']).first()
            if not user:
                user = User(
                    id=teacher_data['user_id'],
                    email=teacher_data['user_id'] + '@example.com',
                    name=teacher_data['name']
                )
                db.session.add(user)
            
            teacher = Teacher(
                user_id=teacher_data['user_id'],
                expertise=teacher_data['expertise']
            )
            db.session.add(teacher)
            db.session.flush()  # Get the ID
        teachers.append(teacher)
    
    db.session.commit()
    return teachers
def seed_courses():
    """Seed the database with course data"""
    
    print("🌱 Starting database seeding...")
    
    # Check if already seeded
    if check_if_already_seeded():
        return
    
    # Create teachers first
    print("👨‍🏫 Creating teachers...")
    teachers = create_teachers()
    
    # Course data matching the frontend
    courses_data = [
        {
            'title': 'Introduction to Machine Learning',
            'description': 'Master the fundamentals of machine learning, from basic algorithms to advanced neural networks. Learn to build and deploy ML models using Python and popular frameworks.',
            'teacher_id': teachers[0].id,
            'subject': 'Computer Science',
            'level': 'Intermediate',
            'total_lessons': 20,
            'syllabus': [
                {'week': 1, 'title': 'Introduction to ML', 'lessons': 4},
                {'week': 2, 'title': 'Supervised Learning', 'lessons': 5},
                {'week': 3, 'title': 'Neural Networks', 'lessons': 6},
                {'week': 4, 'title': 'Deep Learning', 'lessons': 5}
            ]
        },
        {
            'title': 'Advanced Organic Chemistry',
            'description': 'Deep dive into organic chemistry mechanisms, synthesis strategies, and advanced reaction pathways. Perfect for students preparing for advanced studies.',
            'teacher_id': teachers[1].id,
            'subject': 'Science',
            'level': 'Advanced',
            'total_lessons': 18,
            'syllabus': [
                {'week': 1, 'title': 'Basics of Organic Chemistry', 'lessons': 4},
                {'week': 2, 'title': 'Functional Groups', 'lessons': 5},
                {'week': 3, 'title': 'Reaction Mechanisms', 'lessons': 4},
                {'week': 4, 'title': 'Synthesis', 'lessons': 5}
            ]
        },
        {
            'title': 'The Renaissance Era',
            'description': 'Explore the cultural, artistic, and intellectual rebirth of Europe from the 14th to 17th century. Understand the impact on modern civilization.',
            'teacher_id': teachers[2].id,
            'subject': 'History',
            'level': 'Beginner',
            'total_lessons': 14,
            'syllabus': [
                {'week': 1, 'title': 'Dawn of Renaissance', 'lessons': 3},
                {'week': 2, 'title': 'Art & Architecture', 'lessons': 4},
                {'week': 3, 'title': 'The Italian States', 'lessons': 4},
                {'week': 4, 'title': 'Legacy & Impact', 'lessons': 3}
            ]
        },
        {
            'title': 'Calculus II: Integration & Series',
            'description': 'Master integration techniques, applications of integrals, and infinite series. Build a strong foundation for advanced mathematics.',
            'teacher_id': teachers[3].id,
            'subject': 'Mathematics',
            'level': 'Intermediate',
            'total_lessons': 22,
            'syllabus': [
                {'week': 1, 'title': 'Integration Fundamentals', 'lessons': 4},
                {'week': 2, 'title': 'Advanced Techniques', 'lessons': 5},
                {'week': 3, 'title': 'Applications', 'lessons': 6},
                {'week': 4, 'title': 'Series & Sequences', 'lessons': 7}
            ]
        },
        {
            'title': 'Data Structures & Algorithms',
            'description': 'Learn essential data structures and algorithmic techniques. Prepare for technical interviews and build efficient software.',
            'teacher_id': teachers[0].id,
            'subject': 'Computer Science',
            'level': 'Intermediate',
            'total_lessons': 24,
            'syllabus': [
                {'week': 1, 'title': 'Array & Strings', 'lessons': 6},
                {'week': 2, 'title': 'Linked Lists & Trees', 'lessons': 6},
                {'week': 3, 'title': 'Graphs & Algorithms', 'lessons': 6},
                {'week': 4, 'title': 'Dynamic Programming', 'lessons': 6}
            ]
        },
        {
            'title': 'Introduction to Philosophy',
            'description': 'Explore fundamental questions about existence, knowledge, values, and reason through the works of great thinkers.',
            'teacher_id': teachers[2].id,
            'subject': 'History',
            'level': 'Beginner',
            'total_lessons': 16,
            'syllabus': [
                {'week': 1, 'title': 'Ancient Philosophy', 'lessons': 4},
                {'week': 2, 'title': 'Medieval Thought', 'lessons': 4},
                {'week': 3, 'title': 'Modern Philosophy', 'lessons': 4},
                {'week': 4, 'title': 'Contemporary Ideas', 'lessons': 4}
            ]
        },
        {
            'title': 'Spanish for Beginners',
            'description': 'Start your journey to fluency in Spanish. Learn essential vocabulary, grammar, and conversation skills.',
            'teacher_id': teachers[2].id,
            'subject': 'Languages',
            'level': 'Beginner',
            'total_lessons': 20,
            'syllabus': [
                {'week': 1, 'title': 'Basic Greetings', 'lessons': 5},
                {'week': 2, 'title': 'Grammar Fundamentals', 'lessons': 5},
                {'week': 3, 'title': 'Everyday Conversations', 'lessons': 5},
                {'week': 4, 'title': 'Reading & Writing', 'lessons': 5}
            ]
        },
        {
            'title': 'Introduction to Physics',
            'description': 'Discover the fundamental laws governing the physical world. From mechanics to electromagnetism.',
            'teacher_id': teachers[1].id,
            'subject': 'Science',
            'level': 'Beginner',
            'total_lessons': 18,
            'syllabus': [
                {'week': 1, 'title': 'Classical Mechanics', 'lessons': 5},
                {'week': 2, 'title': 'Thermodynamics', 'lessons': 4},
                {'week': 3, 'title': 'Electricity & Magnetism', 'lessons': 5},
                {'week': 4, 'title': 'Modern Physics', 'lessons': 4}
            ]
        },
        {
            'title': 'Web Development Bootcamp',
            'description': 'Become a full-stack web developer. Learn HTML, CSS, JavaScript, React, Node.js, and database management.',
            'teacher_id': teachers[0].id,
            'subject': 'Computer Science',
            'level': 'Beginner',
            'total_lessons': 30,
            'syllabus': [
                {'week': 1, 'title': 'HTML & CSS Basics', 'lessons': 8},
                {'week': 2, 'title': 'JavaScript Fundamentals', 'lessons': 8},
                {'week': 3, 'title': 'React & Frontend', 'lessons': 7},
                {'week': 4, 'title': 'Backend & Databases', 'lessons': 7}
            ]
        },
        {
            'title': 'Linear Algebra',
            'description': 'Master vectors, matrices, and linear transformations. Essential for data science, ML, and engineering.',
            'teacher_id': teachers[3].id,
            'subject': 'Mathematics',
            'level': 'Intermediate',
            'total_lessons': 20,
            'syllabus': [
                {'week': 1, 'title': 'Vectors & Matrices', 'lessons': 5},
                {'week': 2, 'title': 'Linear Transformations', 'lessons': 5},
                {'week': 3, 'title': 'Eigenvalues', 'lessons': 5},
                {'week': 4, 'title': 'Applications', 'lessons': 5}
            ]
        }
    ]
    
    # Insert courses
    print(f"📚 Inserting {len(courses_data)} courses...")
    created_courses = []
    
    for course_data in courses_data:
        # Extract syllabus before creating course
        syllabus = course_data.pop('syllabus', [])
        subject = course_data.pop('subject', '')
        level = course_data.pop('level', '')
        total_lessons = course_data.pop('total_lessons', 0)
        
        # Create course
        course = Course(**course_data)
        db.session.add(course)
        db.session.flush()  # Get the course ID
        
        created_courses.append(course)
        print(f"  ✓ Created: {course.title}")
    
    # Commit all courses
    db.session.commit()
    
    print(f"\n✅ Successfully seeded {len(created_courses)} courses!")
    print("\n📊 Summary:")
    print(f"  - Total Courses: {len(created_courses)}")
    print(f"  - Total Teachers: {len(teachers)}")
    
    # Create sample enrollments for demo
    print("\n👥 Creating sample enrollments...")
    create_sample_enrollments(created_courses)
    
    print("\n🎉 Database seeding completed successfully!")
def create_sample_enrollments(courses):
    """Create sample course enrollments for testing"""
    sample_users = [
        'user_123',
        'user_456',
        'user_789'
    ]
    
    enrollments_created = 0
    
    # Enroll first user in first 3 courses with varying progress
    for i, course in enumerate(courses[:3]):
        enrollment = CourseEnrollment(
            user_id=sample_users[0],
            course_id=course.id,
            progress=(i + 1) * 25  # 25%, 50%, 75%
        )
        db.session.add(enrollment)
        enrollments_created += 1
    
    # Enroll second user in 2 courses
    for course in courses[3:5]:
        enrollment = CourseEnrollment(
            user_id=sample_users[1],
            course_id=course.id,
            progress=15
        )
        db.session.add(enrollment)
        enrollments_created += 1
    
    db.session.commit()
    print(f"  ✓ Created {enrollments_created} sample enrollments")
if __name__ == '__main__':
    with app.app_context():
        try:
            seed_courses()
        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}")
            db.session.rollback()
            sys.exit(1)