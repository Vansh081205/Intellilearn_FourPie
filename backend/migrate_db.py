"""
Migrate Course Table Schema
Adds new columns to existing Course table for the enhanced course system
"""

import sqlite3
import os


def migrate_course_schema():
    """Add new columns to Course table"""

    db_path = os.path.join(os.path.dirname(__file__), 'intellilearn.db')

    if not os.path.exists(db_path):
        print("❌ Database not found. Run app_new.py first to create it.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("🔧 Migrating Course table schema...")

        # Check existing columns
        cursor.execute("PRAGMA table_info(course)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        print(f"📋 Existing columns: {existing_columns}")

        migrations_applied = []

        # Add subject column
        if 'subject' not in existing_columns:
            print("   Adding 'subject' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN subject VARCHAR(100)")
            migrations_applied.append('subject')

        # Add category column
        if 'category' not in existing_columns:
            print("   Adding 'category' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN category VARCHAR(50)")
            migrations_applied.append('category')

        # Add level column
        if 'level' not in existing_columns:
            print("   Adding 'level' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN level VARCHAR(20) DEFAULT 'Beginner'")
            cursor.execute("UPDATE course SET level = 'Beginner' WHERE level IS NULL")
            migrations_applied.append('level')

        # Add duration column
        if 'duration' not in existing_columns:
            print("   Adding 'duration' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN duration VARCHAR(50)")
            migrations_applied.append('duration')

        # Add thumbnail column
        if 'thumbnail' not in existing_columns:
            print("   Adding 'thumbnail' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN thumbnail VARCHAR(10) DEFAULT '📚'")
            cursor.execute("UPDATE course SET thumbnail = '📚' WHERE thumbnail IS NULL")
            migrations_applied.append('thumbnail')

        # Add color column
        if 'color' not in existing_columns:
            print("   Adding 'color' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN color VARCHAR(50) DEFAULT 'from-blue-500 to-indigo-600'")
            cursor.execute("UPDATE course SET color = 'from-blue-500 to-indigo-600' WHERE color IS NULL")
            migrations_applied.append('color')

        # Add rating column
        if 'rating' not in existing_columns:
            print("   Adding 'rating' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN rating FLOAT DEFAULT 0.0")
            cursor.execute("UPDATE course SET rating = 0.0 WHERE rating IS NULL")
            migrations_applied.append('rating')

        # Add students_count column
        if 'students_count' not in existing_columns:
            print("   Adding 'students_count' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN students_count INTEGER DEFAULT 0")
            cursor.execute("UPDATE course SET students_count = 0 WHERE students_count IS NULL")
            migrations_applied.append('students_count')

        # Add total_lessons column
        if 'total_lessons' not in existing_columns:
            print("   Adding 'total_lessons' column...")
            cursor.execute("ALTER TABLE course ADD COLUMN total_lessons INTEGER DEFAULT 0")
            cursor.execute("UPDATE course SET total_lessons = 0 WHERE total_lessons IS NULL")
            migrations_applied.append('total_lessons')

        if migrations_applied:
            conn.commit()
            print(f"\n✅ Migration completed! Added {len(migrations_applied)} columns:")
            for col in migrations_applied:
                print(f"   ✓ {col}")
        else:
            print("\n✅ Schema already up to date - no migration needed")

        # Verify final schema
        cursor.execute("PRAGMA table_info(course)")
        final_columns = [col[1] for col in cursor.fetchall()]
        print(f"\n📊 Final Course table columns: {final_columns}")

        conn.close()
        print("\n🚀 Ready to seed courses! Run: python seed_courses.py")

    except Exception as e:
        print(f"❌ Migration error: {e}")
        import traceback
        traceback.print_exc()
        print("\n💡 If error persists, you can:")
        print("   1. Backup important data")
        print("   2. Delete intellilearn.db")
        print("   3. Run: python app_new.py (recreates DB)")
        print("   4. Run: python seed_courses.py")


if __name__ == '__main__':
    migrate_course_schema()