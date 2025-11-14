"""
Seed Analytics Data
Adds sample data to test leaderboard and analytics features
"""

from app_new import app, db
from app_modules.models import User, StudentAnalytics, QuizSession, QuestionAttempt
from datetime import datetime, timedelta
import random


def seed_analytics_data():
    """Add sample analytics data for testing"""
    with app.app_context():
        print("🌱 Seeding analytics data...")

        # Get existing users
        users = User.query.all()

        if not users:
            print("❌ No users found. Create some users first.")
            return

        print(f"📊 Found {len(users)} users")

        # For each user, create analytics data
        for i, user in enumerate(users[:5]):  # Limit to first 5 users
            print(f"\n👤 Creating data for user {i + 1}/{min(5, len(users))}: {user.id[:20]}...")

            # Create or get analytics
            analytics = StudentAnalytics.query.filter_by(user_id=user.id).first()
            if not analytics:
                analytics = StudentAnalytics(user_id=user.id)
                db.session.add(analytics)

            # Generate random but realistic data
            num_quizzes = random.randint(3, 15)

            for quiz_num in range(num_quizzes):
                # Create quiz session
                difficulty = random.choice(['easy', 'medium', 'hard'])
                total_q = random.randint(5, 10)

                # Accuracy varies by difficulty
                if difficulty == 'easy':
                    accuracy = random.uniform(0.7, 0.95)
                elif difficulty == 'medium':
                    accuracy = random.uniform(0.5, 0.85)
                else:
                    accuracy = random.uniform(0.3, 0.70)

                score = int(total_q * accuracy)

                # Create session with realistic timestamps
                days_ago = num_quizzes - quiz_num
                started_at = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
                duration = random.randint(180, 600)  # 3-10 minutes

                session = QuizSession(
                    user_id=user.id,
                    quiz_id=f'quiz_{random.randint(1000, 9999)}',
                    difficulty=difficulty,
                    started_at=started_at,
                    completed_at=started_at + timedelta(seconds=duration),
                    duration=duration,
                    score=score,
                    total_questions=total_q,
                    is_multiplayer=False
                )
                db.session.add(session)

                # Update analytics
                analytics.total_quizzes += 1
                analytics.total_questions += total_q
                analytics.correct_answers += score

                if difficulty == 'easy':
                    analytics.easy_attempts += total_q
                    analytics.easy_correct += score
                elif difficulty == 'medium':
                    analytics.medium_attempts += total_q
                    analytics.medium_correct += score
                else:
                    analytics.hard_attempts += total_q
                    analytics.hard_correct += score

            # Calculate final stats
            if analytics.total_questions > 0:
                accuracy = analytics.correct_answers / analytics.total_questions
                analytics.mastery_score = min(100, accuracy * 100 + random.uniform(0, 20))
                analytics.study_streak = random.randint(1, 14)
                analytics.longest_streak = max(analytics.study_streak, random.randint(5, 30))
                analytics.avg_study_time = random.uniform(5, 15)
                analytics.learning_velocity = random.uniform(-0.1, 0.2)
                analytics.predicted_difficulty = random.choice(['easy', 'medium', 'hard'])
                analytics.last_activity = datetime.utcnow() - timedelta(days=random.randint(0, 2))

                # Update user points
                user.points = analytics.correct_answers * 10

            print(f"   ✓ Created {num_quizzes} quiz sessions")
            print(f"   ✓ Analytics: {analytics.total_quizzes} quizzes, {analytics.mastery_score:.1f} mastery")

        db.session.commit()

        print("\n✅ Analytics data seeded successfully!")
        print(f"   Total sessions created: {QuizSession.query.count()}")
        print(f"   Total analytics records: {StudentAnalytics.query.count()}")
        print("\n📊 You can now view the leaderboard and analytics!")


if __name__ == '__main__':
    seed_analytics_data()
