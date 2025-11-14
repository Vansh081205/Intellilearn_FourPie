from flask import Blueprint, request, jsonify
import json
from datetime import datetime, timedelta
from app_modules.models import db, User, StudentAnalytics, QuizSession, RecommendedQuiz, Quiz, Document, QuizAttempt
from app_modules.models import StudentClassification, QuestionAttempt, ConceptMastery
from app_modules.services.ml_analytics import MLAnalyticsEngine
from app_modules.services.student_classifier import EducationalDataAnalyst

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')
ml_engine = MLAnalyticsEngine()
edu_analyst = EducationalDataAnalyst()


def get_or_create_analytics(user_id):
    """Get or create analytics record for user"""
    analytics = StudentAnalytics.query.filter_by(user_id=user_id).first()
    if not analytics:
        analytics = StudentAnalytics(user_id=user_id)
        db.session.add(analytics)
        db.session.commit()
    return analytics


def get_or_create_user(user_id):
    """Get or create user"""
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user


@analytics_bp.route('/dashboard/<user_id>', methods=['GET'])
def get_enhanced_dashboard(user_id):
    """Get comprehensive dashboard with ML insights"""
    try:
        get_or_create_user(user_id)
        analytics = get_or_create_analytics(user_id)

        # Get recent quiz sessions
        recent_sessions = QuizSession.query.filter_by(user_id=user_id).order_by(
            QuizSession.created_at.desc()
        ).limit(20).all()

        sessions_data = [{
            'score': s.score,
            'total_questions': s.total_questions,
            'difficulty': s.difficulty,
            'duration': s.duration,
            'created_at': s.created_at.isoformat() if s.created_at else None
        } for s in recent_sessions]

        # Convert analytics to dict
        analytics_dict = {
            'user_id': analytics.user_id,
            'total_quizzes': analytics.total_quizzes,
            'total_questions': analytics.total_questions,
            'correct_answers': analytics.correct_answers,
            'easy_attempts': analytics.easy_attempts,
            'easy_correct': analytics.easy_correct,
            'medium_attempts': analytics.medium_attempts,
            'medium_correct': analytics.medium_correct,
            'hard_attempts': analytics.hard_attempts,
            'hard_correct': analytics.hard_correct,
            'topic_performance': analytics.topic_performance,
            'avg_study_time': analytics.avg_study_time,
            'study_streak': analytics.study_streak,
            'longest_streak': analytics.longest_streak,
            'last_activity': analytics.last_activity,
            'predicted_difficulty': analytics.predicted_difficulty,
            'learning_velocity': analytics.learning_velocity,
            'mastery_score': analytics.mastery_score
        }

        # Calculate ML-based insights
        mastery = ml_engine.calculate_mastery_score(analytics_dict)
        insights = ml_engine.generate_insights(analytics_dict, sessions_data)

        # Get user documents for recommendations
        user_documents = Document.query.filter_by(user_id=user_id).order_by(
            Document.created_at.desc()
        ).limit(5).all()

        docs_data = [{
            'id': d.id,
            'title': d.filename,
            'created_at': d.created_at.isoformat() if d.created_at else None
        } for d in user_documents]

        # Generate recommendations
        recommendations = ml_engine.generate_personalized_recommendations(
            analytics_dict, sessions_data, docs_data
        )

        # Calculate adaptive difficulty
        adaptive_diff, confidence = ml_engine.calculate_adaptive_difficulty(
            analytics_dict, sessions_data
        )

        # Update analytics with new predictions
        analytics.mastery_score = mastery
        analytics.predicted_difficulty = adaptive_diff
        analytics.learning_velocity = ml_engine._calculate_learning_velocity(sessions_data) if sessions_data else 0.0
        db.session.commit()

        # Calculate accuracy percentages
        overall_accuracy = (
                    analytics.correct_answers / analytics.total_questions * 100) if analytics.total_questions > 0 else 0
        easy_accuracy = (analytics.easy_correct / analytics.easy_attempts * 100) if analytics.easy_attempts > 0 else 0
        medium_accuracy = (
                    analytics.medium_correct / analytics.medium_attempts * 100) if analytics.medium_attempts > 0 else 0
        hard_accuracy = (analytics.hard_correct / analytics.hard_attempts * 100) if analytics.hard_attempts > 0 else 0

        return jsonify({
            'success': True,
            'analytics': {
                'total_quizzes': analytics.total_quizzes,
                'total_questions': analytics.total_questions,
                'correct_answers': analytics.correct_answers,
                'overall_accuracy': round(overall_accuracy, 1),
                'mastery_score': round(mastery, 1),
                'study_streak': analytics.study_streak,
                'longest_streak': analytics.longest_streak,
                'avg_study_time': round(analytics.avg_study_time, 1),
                'predicted_difficulty': adaptive_diff,
                'learning_velocity': round(analytics.learning_velocity, 3),
                'difficulty_breakdown': {
                    'easy': {
                        'attempts': analytics.easy_attempts,
                        'correct': analytics.easy_correct,
                        'accuracy': round(easy_accuracy, 1)
                    },
                    'medium': {
                        'attempts': analytics.medium_attempts,
                        'correct': analytics.medium_correct,
                        'accuracy': round(medium_accuracy, 1)
                    },
                    'hard': {
                        'attempts': analytics.hard_attempts,
                        'correct': analytics.hard_correct,
                        'accuracy': round(hard_accuracy, 1)
                    }
                }
            },
            'insights': insights,
            'recommendations': recommendations,
            'recent_sessions': sessions_data[:7],  # Last 7 sessions
            'adaptive_difficulty': {
                'recommended': adaptive_diff,
                'confidence': confidence
            }
        })

    except Exception as e:
        print(f"Error in get_enhanced_dashboard: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/start-session', methods=['POST'])
def start_quiz_session():
    """Start a new quiz session"""
    try:
        data = request.json
        user_id = data['user_id']
        quiz_id = data['quiz_id']
        difficulty = data.get('difficulty', 'medium')
        is_multiplayer = data.get('is_multiplayer', False)
        room_code = data.get('room_code')

        get_or_create_user(user_id)

        session = QuizSession(
            user_id=user_id,
            quiz_id=quiz_id,
            difficulty=difficulty,
            is_multiplayer=is_multiplayer,
            room_code=room_code,
            started_at=datetime.utcnow()
        )

        db.session.add(session)
        db.session.commit()

        return jsonify({
            'success': True,
            'session_id': session.id
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/end-session', methods=['POST'])
def end_quiz_session():
    """End a quiz session and update analytics"""
    try:
        data = request.json
        session_id = data['session_id']
        score = data['score']
        total_questions = data['total_questions']
        question_timings = data.get('question_timings', [])
        powerups_used = data.get('powerups_used', [])
        final_rank = data.get('final_rank')

        session = QuizSession.query.get(session_id)
        if not session:
            return jsonify({'success': False, 'error': 'Session not found'}), 404

        # Update session
        session.completed_at = datetime.utcnow()
        session.duration = int((session.completed_at - session.started_at).total_seconds())
        session.score = score
        session.total_questions = total_questions
        session.question_timings = json.dumps(question_timings)
        session.powerups_used = json.dumps(powerups_used)
        session.final_rank = final_rank

        # Update analytics
        analytics = get_or_create_analytics(session.user_id)
        analytics.total_quizzes += 1
        analytics.total_questions += total_questions
        analytics.correct_answers += score

        # Update difficulty-specific stats
        if session.difficulty == 'easy':
            analytics.easy_attempts += total_questions
            analytics.easy_correct += score
        elif session.difficulty == 'medium':
            analytics.medium_attempts += total_questions
            analytics.medium_correct += score
        elif session.difficulty == 'hard':
            analytics.hard_attempts += total_questions
            analytics.hard_correct += score

        # Update study time
        study_minutes = session.duration / 60
        if analytics.avg_study_time == 0:
            analytics.avg_study_time = study_minutes
        else:
            # Running average
            total_study = analytics.avg_study_time * (analytics.total_quizzes - 1)
            analytics.avg_study_time = (total_study + study_minutes) / analytics.total_quizzes

        # Update streak
        if analytics.last_activity:
            days_since = (datetime.utcnow() - analytics.last_activity).days
            if days_since <= 1:
                analytics.study_streak += 1
            else:
                analytics.study_streak = 1
        else:
            analytics.study_streak = 1

        analytics.longest_streak = max(analytics.longest_streak, analytics.study_streak)
        analytics.last_activity = datetime.utcnow()

        # Update user points
        user = User.query.get(session.user_id)
        if user:
            difficulty_points = {'easy': 5, 'medium': 10, 'hard': 20}
            points_per_question = difficulty_points.get(session.difficulty, 10)
            user.points += (score * points_per_question)

        db.session.commit()

        return jsonify({
            'success': True,
            'analytics_updated': True,
            'new_streak': analytics.study_streak,
            'total_points': user.points if user else 0
        })

    except Exception as e:
        db.session.rollback()
        print(f"Error in end_quiz_session: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    """Get AI-powered quiz recommendations"""
    try:
        get_or_create_user(user_id)
        analytics = get_or_create_analytics(user_id)

        # Get recent sessions
        recent_sessions = QuizSession.query.filter_by(user_id=user_id).order_by(
            QuizSession.created_at.desc()
        ).limit(20).all()

        sessions_data = [{
            'score': s.score,
            'total_questions': s.total_questions,
            'difficulty': s.difficulty
        } for s in recent_sessions]

        analytics_dict = {
            'user_id': analytics.user_id,
            'total_quizzes': analytics.total_quizzes,
            'total_questions': analytics.total_questions,
            'correct_answers': analytics.correct_answers,
            'easy_attempts': analytics.easy_attempts,
            'easy_correct': analytics.easy_correct,
            'medium_attempts': analytics.medium_attempts,
            'medium_correct': analytics.medium_correct,
            'hard_attempts': analytics.hard_attempts,
            'hard_correct': analytics.hard_correct,
            'topic_performance': analytics.topic_performance,
            'study_streak': analytics.study_streak,
            'last_activity': analytics.last_activity,
            'predicted_difficulty': analytics.predicted_difficulty
        }

        # Get user documents
        user_documents = Document.query.filter_by(user_id=user_id).order_by(
            Document.created_at.desc()
        ).limit(5).all()

        docs_data = [{
            'id': d.id,
            'title': d.filename,
        } for d in user_documents]

        # Generate recommendations
        recommendations = ml_engine.generate_personalized_recommendations(
            analytics_dict, sessions_data, docs_data
        )

        return jsonify({
            'success': True,
            'recommendations': recommendations
        })

    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/predict-performance', methods=['POST'])
def predict_performance():
    """Predict performance on a specific quiz"""
    try:
        data = request.json
        user_id = data['user_id']
        difficulty = data['difficulty']
        topic = data.get('topic')

        get_or_create_user(user_id)
        analytics = get_or_create_analytics(user_id)

        analytics_dict = {
            'easy_attempts': analytics.easy_attempts,
            'easy_correct': analytics.easy_correct,
            'medium_attempts': analytics.medium_attempts,
            'medium_correct': analytics.medium_correct,
            'hard_attempts': analytics.hard_attempts,
            'hard_correct': analytics.hard_correct,
            'topic_performance': analytics.topic_performance
        }

        prediction = ml_engine.predict_quiz_performance(analytics_dict, difficulty, topic)

        return jsonify({
            'success': True,
            'prediction': prediction
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/performance-history/<user_id>', methods=['GET'])
def get_performance_history(user_id):
    """Get detailed performance history"""
    try:
        days = request.args.get('days', 30, type=int)
        since = datetime.utcnow() - timedelta(days=days)

        sessions = QuizSession.query.filter(
            QuizSession.user_id == user_id,
            QuizSession.completed_at >= since
        ).order_by(QuizSession.completed_at).all()

        history = []
        for s in sessions:
            accuracy = (s.score / s.total_questions * 100) if s.total_questions > 0 else 0
            history.append({
                'date': s.completed_at.isoformat() if s.completed_at else None,
                'quiz_id': s.quiz_id,
                'score': s.score,
                'total_questions': s.total_questions,
                'accuracy': round(accuracy, 1),
                'difficulty': s.difficulty,
                'duration': s.duration,
                'is_multiplayer': s.is_multiplayer
            })

        return jsonify({
            'success': True,
            'history': history,
            'total_sessions': len(history)
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/classify/<user_id>', methods=['GET'])
def classify_student(user_id):
    """Get comprehensive student classification using Educational Data Analyst"""
    try:
        get_or_create_user(user_id)

        # Gather data for classification
        sessions = QuizSession.query.filter_by(user_id=user_id).order_by(
            QuizSession.created_at
        ).all()

        questions = QuestionAttempt.query.filter_by(user_id=user_id).all()

        concepts = ConceptMastery.query.filter_by(user_id=user_id).all()

        # Prepare data for analyst
        sessions_data = [{
            'score': s.score,
            'total_questions': s.total_questions,
            'difficulty': s.difficulty,
            'duration': s.duration,
            'created_at': s.created_at.isoformat() if s.created_at else None
        } for s in sessions]

        questions_data = [{
            'question_index': q.question_index,
            'question_text': q.question_text,
            'is_correct': q.is_correct,
            'time_spent': q.time_spent,
            'difficulty': q.difficulty,
            'attempts_on_question': q.attempts_on_question,
            'error_type': q.error_type
        } for q in questions]

        concepts_data = {
            c.concept_name: {
                'total_attempts': c.total_attempts,
                'correct_attempts': c.correct_attempts,
                'mastery_level': c.mastery_level
            }
            for c in concepts
        }

        student_data = {
            'user_id': user_id,
            'quiz_sessions': sessions_data,
            'question_attempts': questions_data,
            'concept_mastery': concepts_data
        }

        # Perform classification
        classification_result = edu_analyst.classify_student(student_data)

        # Store/update classification in database
        classification = StudentClassification.query.filter_by(user_id=user_id).first()

        if not classification:
            classification = StudentClassification(user_id=user_id)
            db.session.add(classification)

        # Update classification
        classification.capacity_category = classification_result['classification']['capacity']
        classification.capacity_confidence = classification_result['classification']['capacity_confidence']
        classification.capacity_evidence = json.dumps(classification_result['detailed_analysis']['capacity_evidence'])

        classification.trajectory_category = classification_result['classification']['trajectory']
        classification.trajectory_confidence = classification_result['classification']['trajectory_confidence']
        classification.trajectory_trend_data = json.dumps(classification_result['detailed_analysis']['trajectory_data'])

        classification.primary_error_pattern = classification_result['classification']['primary_error_pattern']
        classification.error_confidence = classification_result['classification']['error_confidence']
        classification.error_examples = json.dumps(classification_result['detailed_analysis']['error_examples'])

        classification.recommended_intervention = classification_result['recommended_intervention']
        classification.intervention_priority = classification_result['intervention_priority']

        classification.last_analysis = datetime.utcnow()
        classification.analysis_count += 1

        db.session.commit()

        return jsonify({
            'success': True,
            'classification': classification_result
        })

    except Exception as e:
        print(f"Error in classify_student: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get global leaderboard based on analytics"""
    try:
        # Get query parameters
        time_filter = request.args.get('time_filter', 'all-time')  # daily, weekly, monthly, all-time
        limit = request.args.get('limit', 50, type=int)
        current_user_id = request.args.get('user_id')

        # Calculate time cutoff
        cutoff_date = None
        if time_filter == 'daily':
            cutoff_date = datetime.utcnow() - timedelta(days=1)
        elif time_filter == 'weekly':
            cutoff_date = datetime.utcnow() - timedelta(weeks=1)
        elif time_filter == 'monthly':
            cutoff_date = datetime.utcnow() - timedelta(days=30)

        # Base query for analytics
        query = StudentAnalytics.query

        # Apply time filter if needed
        if cutoff_date:
            query = query.filter(StudentAnalytics.last_activity >= cutoff_date)

        # Get all analytics and calculate leaderboard scores
        all_analytics = query.all()

        leaderboard = []
        for analytics in all_analytics:
            # Calculate comprehensive score
            # Formula: mastery_score * 10 + total_questions * 0.5 + streak * 50 + accuracy * 5
            accuracy = (
                        analytics.correct_answers / analytics.total_questions * 100) if analytics.total_questions > 0 else 0

            score = (
                    analytics.mastery_score * 10 +  # Mastery is most important
                    analytics.total_questions * 0.5 +  # Activity matters
                    analytics.study_streak * 50 +  # Consistency bonus
                    accuracy * 5  # Accuracy bonus
            )

            # Get user info
            user = User.query.get(analytics.user_id)

            # Calculate rank change (simplified - comparing to last week)
            # In production, you'd store historical rankings
            rank_change = 0  # TODO: Implement historical rank comparison

            leaderboard.append({
                'user_id': analytics.user_id,
                'score': round(score, 2),
                'mastery_score': round(analytics.mastery_score, 1),
                'total_quizzes': analytics.total_quizzes,
                'total_questions': analytics.total_questions,
                'correct_answers': analytics.correct_answers,
                'accuracy': round(accuracy, 1),
                'study_streak': analytics.study_streak,
                'longest_streak': analytics.longest_streak,
                'predicted_difficulty': analytics.predicted_difficulty,
                'learning_velocity': round(analytics.learning_velocity, 3),
                'points': user.points if user else 0,
                'rank_change': rank_change,
                'is_current_user': analytics.user_id == current_user_id
            })

        # Sort by score (descending)
        leaderboard.sort(key=lambda x: x['score'], reverse=True)

        # Add ranks
        for i, entry in enumerate(leaderboard):
            entry['rank'] = i + 1

            # Add badge for top 3
            if entry['rank'] == 1:
                entry['badge'] = 'gold'
            elif entry['rank'] == 2:
                entry['badge'] = 'silver'
            elif entry['rank'] == 3:
                entry['badge'] = 'bronze'
            else:
                entry['badge'] = None

        # Limit results
        top_leaderboard = leaderboard[:limit]

        # Find current user's position if not in top
        current_user_entry = None
        if current_user_id:
            current_user_entry = next((e for e in leaderboard if e['user_id'] == current_user_id), None)
            if current_user_entry and current_user_entry['rank'] > limit:
                # User is outside top N, include them separately
                pass

        return jsonify({
            'success': True,
            'leaderboard': top_leaderboard,
            'current_user': current_user_entry,
            'total_participants': len(leaderboard),
            'time_filter': time_filter
        })

    except Exception as e:
        print(f"Error in get_leaderboard: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500


@analytics_bp.route('/leaderboard/stats/<user_id>', methods=['GET'])
def get_leaderboard_stats(user_id):
    """Get detailed stats for a user on the leaderboard"""
    try:
        get_or_create_user(user_id)
        analytics = get_or_create_analytics(user_id)

        # Get recent performance (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_sessions = QuizSession.query.filter(
            QuizSession.user_id == user_id,
            QuizSession.completed_at >= week_ago
        ).all()

        quizzes_this_week = len(recent_sessions)
        points_this_week = sum(s.score * 10 for s in recent_sessions)  # 10 points per correct answer

        # Calculate wins (sessions with >80% accuracy)
        wins_this_week = sum(1 for s in recent_sessions
                             if s.total_questions > 0 and (s.score / s.total_questions) >= 0.8)

        # Progress to next level (based on mastery score)
        current_mastery = analytics.mastery_score
        next_level_threshold = ((current_mastery // 10) + 1) * 10  # Next multiple of 10
        progress_percentage = ((current_mastery % 10) / 10) * 100

        return jsonify({
            'success': True,
            'stats': {
                'quizzes_this_week': quizzes_this_week,
                'points_this_week': points_this_week,
                'wins_this_week': wins_this_week,
                'current_streak': analytics.study_streak,
                'progress_to_next_level': round(progress_percentage, 1),
                'current_mastery': round(current_mastery, 1),
                'next_level_threshold': next_level_threshold,
                'total_points': 0  # TODO: Calculate from User model
            }
        })

    except Exception as e:
        print(f"Error in get_leaderboard_stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
