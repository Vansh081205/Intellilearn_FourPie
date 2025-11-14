"""
Analytics Diagnostic Script
Checks if analytics tables exist and shows their status
"""

import sqlite3
import os


def check_analytics_setup():
    """Check if analytics tables are properly set up"""
    db_path = os.path.join(os.path.dirname(__file__), 'intellilearn.db')

    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        print(f"   Expected at: {db_path}")
        print("\n💡 Run 'python app_new.py' to create the database")
        return

    print(f"✅ Database found: {db_path}")
    print(f"   Size: {os.path.getsize(db_path) / 1024:.2f} KB\n")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    all_tables = [row[0] for row in cursor.fetchall()]

    print(f"📊 Total tables: {len(all_tables)}")
    print(f"   Tables: {', '.join(all_tables)}\n")

    # Check analytics tables
    analytics_tables = [
        'student_analytics',
        'quiz_session',
        'recommended_quiz',
        'student_classification',
        'question_attempt',
        'concept_mastery'
    ]

    print("🔍 Analytics Tables Status:")
    for table in analytics_tables:
        if table in all_tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"   ✓ {table:<30} {count} records")
        else:
            print(f"   ❌ {table:<30} MISSING!")

    # Check user table
    print("\n👤 User Table:")
    if 'user' in all_tables:
        cursor.execute("SELECT COUNT(*) FROM user")
        user_count = cursor.fetchone()[0]
        print(f"   ✓ {user_count} users registered")

        if user_count > 0:
            cursor.execute("SELECT id, points FROM user LIMIT 5")
            users = cursor.fetchall()
            print("   Sample users:")
            for user_id, points in users:
                print(f"     - ID: {user_id[:30]}..., Points: {points}")

    # Check quiz attempts
    print("\n🎯 Quiz Activity:")
    if 'quiz_attempt' in all_tables:
        cursor.execute("SELECT COUNT(*) FROM quiz_attempt")
        attempt_count = cursor.fetchone()[0]
        print(f"   {attempt_count} quiz attempts recorded")

    # Check analytics data
    print("\n📈 Analytics Data:")
    if 'student_analytics' in all_tables:
        cursor.execute("SELECT COUNT(*) FROM student_analytics")
        analytics_count = cursor.fetchone()[0]
        print(f"   {analytics_count} student analytics records")

        if analytics_count > 0:
            cursor.execute("""
                           SELECT user_id, total_quizzes, total_questions, correct_answers, mastery_score
                           FROM student_analytics
                           ORDER BY total_quizzes DESC LIMIT 5
            """)
            records = cursor.fetchall()
            print("   Top performers:")
            for user_id, quizzes, questions, correct, mastery in records:
                accuracy = (correct / questions * 100) if questions > 0 else 0
                print(
                    f"     - User {user_id[:20]}...: {quizzes} quizzes, {accuracy:.1f}% accuracy, {mastery:.1f} mastery")

    if 'quiz_session' in all_tables:
        cursor.execute("SELECT COUNT(*) FROM quiz_session")
        session_count = cursor.fetchone()[0]
        print(f"   {session_count} quiz sessions tracked")

    conn.close()

    # Recommendations
    print("\n💡 Recommendations:")
    missing_tables = [t for t in analytics_tables if t not in all_tables]
    if missing_tables:
        print(f"   ⚠️  {len(missing_tables)} analytics tables are missing!")
        print("   📋 Run: python backend/fix_analytics.py")
    else:
        print("   ✅ All analytics tables exist!")
        if 'student_analytics' in all_tables:
            cursor = sqlite3.connect(db_path).cursor()
            cursor.execute("SELECT COUNT(*) FROM student_analytics")
            if cursor.fetchone()[0] == 0:
                print("   📝 No analytics data yet - take some quizzes to generate data!")


if __name__ == '__main__':
    check_analytics_setup()
