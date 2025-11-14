"""
Analytics Database Fix Script
Recreates all analytics-related tables
"""

from app_new import app, db
from app_modules.models import (
    StudentAnalytics,
    QuizSession,
    RecommendedQuiz,
    StudentClassification,
    QuestionAttempt,
    ConceptMastery
)


def fix_analytics_tables():
    """Drop and recreate all analytics tables"""
    with app.app_context():
        print("🔧 Starting analytics tables fix...")

        # List of analytics tables to fix
        tables_to_fix = [
            (StudentAnalytics, 'student_analytics'),
            (QuizSession, 'quiz_session'),
            (RecommendedQuiz, 'recommended_quiz'),
            (StudentClassification, 'student_classification'),
            (QuestionAttempt, 'question_attempt'),
            (ConceptMastery, 'concept_mastery'),
        ]

        # Drop tables if they exist
        print("\n📊 Dropping existing analytics tables...")
        for model, name in tables_to_fix:
            try:
                model.__table__.drop(db.engine, checkfirst=True)
                print(f"  ✓ Dropped {name}")
            except Exception as e:
                print(f"  ⚠ Could not drop {name}: {e}")

        # Recreate all tables
        print("\n🏗️  Recreating analytics tables...")
        db.create_all()
        print("  ✓ All analytics tables created")

        # Verify tables were created
        print("\n✅ Verifying tables...")
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()

        for _, name in tables_to_fix:
            if name in existing_tables:
                print(f"  ✓ {name} exists")
            else:
                print(f"  ❌ {name} NOT FOUND!")

        print("\n🎉 Analytics tables fix completed!")
        print("\n📋 Next steps:")
        print("  1. Restart your backend server (python app_new.py)")
        print("  2. Refresh your frontend")
        print("  3. Navigate to Student Dashboard → Analytics tab")
        print("  4. Take a quiz to generate analytics data")


if __name__ == '__main__':
    fix_analytics_tables()
