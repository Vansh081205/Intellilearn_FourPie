import os
import sqlite3

def migrate_database_schema():
    """Add missing columns to existing database - SQLite compatible"""
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, '..', '..', 'intellilearn.db')

    if not os.path.exists(db_path):
        print("📊 New database - no migration needed")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(user)")
        user_columns = [col[1] for col in cursor.fetchall()]
        print(f"📋 Existing User columns: {user_columns}")

        migrations_applied = False

        if 'email' not in user_columns:
            print("🔧 Adding 'email' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN email VARCHAR(255)")
            migrations_applied = True

        if 'role' not in user_columns:
            print("🔧 Adding 'role' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'student'")
            cursor.execute("UPDATE user SET role = 'student' WHERE role IS NULL")
            migrations_applied = True

        if 'teacher_id' not in user_columns:
            print("🔧 Adding 'teacher_id' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN teacher_id VARCHAR(50)")
            migrations_applied = True

        if migrations_applied:
            conn.commit()
            print("✅ Database migration completed successfully!")
        else:
            print("✅ Database schema is up to date - no migration needed")

        conn.close()

    except Exception as e:
        print(f"❌ Migration error: {e}")
        print("💡 Tip: If error persists, delete intellilearn.db and restart")
