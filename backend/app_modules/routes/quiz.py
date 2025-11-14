from flask import Blueprint, request, jsonify
import json
from app_modules.models import db, Quiz, QuizAttempt, Document, User
from ai_engine import generate_quiz
from adaptive_logic import AdaptiveEngine

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api')
adaptive_engine = AdaptiveEngine()

def get_or_create_user(user_id):
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

@quiz_bp.route('/generate-quiz', methods=['POST'])
def create_quiz():
    try:
        data = request.json
        doc_id = data['doc_id']
        user_id = data.get('user_id', 'demo_user')
        requested_difficulty = data.get('difficulty', None)

        doc = Document.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        if requested_difficulty and requested_difficulty in ['easy', 'medium', 'hard']:
            difficulty = requested_difficulty
        else:
            attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
            history = [{'correct': a.score > a.total_questions/2, 'difficulty': a.difficulty} for a in attempts]
            difficulty = adaptive_engine.calculate_difficulty(user_id, history)

        if doc.quiz:
            db.session.delete(doc.quiz)
            db.session.commit()

        questions = generate_quiz(doc.text_content, difficulty, num_questions=5)

        new_quiz = Quiz(
            difficulty=difficulty,
            questions_json=json.dumps(questions),
            document_id=doc.id
        )
        db.session.add(new_quiz)
        db.session.commit()

        return jsonify({
            'quiz_id': new_quiz.id,
            'questions': questions,
            'difficulty': difficulty,
            'share_link': f"/playground/{new_quiz.id}"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/submit-answer', methods=['POST'])
def submit_answer():
    try:
        data = request.json
        user_id = data.get('user_id', 'demo_user')
        quiz_id = data['quiz_id']
        question_index = data['question_index']
        user_answer = data['answer']

        user = get_or_create_user(user_id)
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        questions = json.loads(quiz.questions_json)
        question = questions[question_index]
        correct = user_answer == question['correct']

        points_awarded = 0
        if correct:
            difficulty_points = {'easy': 5, 'medium': 10, 'hard': 20}
            points_awarded = difficulty_points.get(quiz.difficulty, 10)
            user.points += points_awarded
            db.session.commit()

        return jsonify({
            'correct': correct,
            'explanation': question.get('explanation', ''),
            'correct_answer': question['correct'],
            'points_awarded': points_awarded,
            'total_points': user.points
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/dashboard/<user_id>', methods=['GET'])
def get_dashboard(user_id):
    try:
        user = get_or_create_user(user_id)
        attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
        history = [{'correct': a.score > a.total_questions/2, 'difficulty': a.difficulty} for a in attempts]
        insights = adaptive_engine.get_insights(user_id, history)

        insights['points'] = user.points
        insights['subscription'] = user.subscription
        insights['total_attempts'] = len(attempts)

        return jsonify(insights)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/playground/<quiz_id>', methods=['GET'])
def get_playground_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        return jsonify({
            'id': quiz.id,
            'quiz_id': quiz.id,
            'questions': json.loads(quiz.questions_json),
            'difficulty': quiz.difficulty
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from flask import Blueprint, request, jsonify
import json
from app_modules.models import db, Quiz, QuizAttempt, Document, User, QuizSession, QuestionAttempt
from ai_engine import generate_quiz
from adaptive_logic import AdaptiveEngine

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api')
adaptive_engine = AdaptiveEngine()

def get_or_create_user(user_id):
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

@quiz_bp.route('/generate-quiz', methods=['POST'])
def create_quiz():
    try:
        data = request.json
        doc_id = data['doc_id']
        user_id = data.get('user_id', 'demo_user')
        requested_difficulty = data.get('difficulty', None)

        doc = Document.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        if requested_difficulty and requested_difficulty in ['easy', 'medium', 'hard']:
            difficulty = requested_difficulty
        else:
            attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
            history = [{'correct': a.score > a.total_questions/2, 'difficulty': a.difficulty} for a in attempts]
            difficulty = adaptive_engine.calculate_difficulty(user_id, history)

        if doc.quiz:
            db.session.delete(doc.quiz)
            db.session.commit()

        questions = generate_quiz(doc.text_content, difficulty, num_questions=5)

        new_quiz = Quiz(
            difficulty=difficulty,
            questions_json=json.dumps(questions),
            document_id=doc.id
        )
        db.session.add(new_quiz)
        db.session.commit()

        return jsonify({
            'quiz_id': new_quiz.id,
            'questions': questions,
            'difficulty': difficulty,
            'share_link': f"/playground/{new_quiz.id}"
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/submit-answer', methods=['POST'])
def submit_answer():
    try:
        data = request.json
        user_id = data.get('user_id', 'demo_user')
        quiz_id = data['quiz_id']
        question_index = data['question_index']
        user_answer = data['answer']

        # Optional analytics metadata
        session_id = data.get('session_id')
        time_spent = data.get('time_spent')
        attempts_on_question = data.get('attempts_on_question', 1)
        question_text_override = data.get('question_text')
        question_topic = data.get('question_topic')
        question_difficulty_override = data.get('question_difficulty')
        powerup_used = data.get('powerup_used')

        user = get_or_create_user(user_id)
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        questions = json.loads(quiz.questions_json)
        question = questions[question_index]
        correct = user_answer == question['correct']

        points_awarded = 0
        if correct:
            difficulty_points = {'easy': 5, 'medium': 10, 'hard': 20}
            points_awarded = difficulty_points.get(quiz.difficulty, 10)
            user.points += points_awarded

        # Record detailed question attempt if session metadata present
        try:
            if session_id:
                session = QuizSession.query.get(session_id)
                if session and session.user_id == user_id:
                    attempt = QuestionAttempt(
                        user_id=user_id,
                        session_id=session_id,
                        quiz_id=quiz_id,
                        question_index=question_index,
                        question_text=question_text_override or question.get('question'),
                        question_topic=question_topic,
                        difficulty=question_difficulty_override or question.get('difficulty') or quiz.difficulty,
                        user_answer=user_answer,
                        correct_answer=question['correct'],
                        is_correct=correct,
                        time_spent=time_spent,
                        attempts_on_question=attempts_on_question,
                        powerup_used=powerup_used
                    )

                    if not correct:
                        difficulty_value = attempt.difficulty or quiz.difficulty
                        if difficulty_value == 'easy':
                            attempt.error_type = 'foundational'
                        elif difficulty_value == 'hard':
                            attempt.error_type = 'application'
                        else:
                            if time_spent is not None and time_spent < 10:
                                attempt.error_type = 'precision'
                            else:
                                attempt.error_type = 'application'

                    db.session.add(attempt)
        except Exception as analytics_error:
            # Do not block quiz flow if analytics logging fails
            db.session.rollback()
            print(f"⚠️ Question logging failed: {analytics_error}")
            # Ensure user points persist if previously updated
            if points_awarded > 0:
                db.session.add(user)
                db.session.commit()
            return jsonify({
                'correct': correct,
                'explanation': question.get('explanation', ''),
                'correct_answer': question['correct'],
                'points_awarded': points_awarded,
                'total_points': user.points
            })

        db.session.commit()

        return jsonify({
            'correct': correct,
            'explanation': question.get('explanation', ''),
            'correct_answer': question['correct'],
            'points_awarded': points_awarded,
            'total_points': user.points
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/dashboard/<user_id>', methods=['GET'])
def get_dashboard(user_id):
    try:
        user = get_or_create_user(user_id)
        attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
        history = [{'correct': a.score > a.total_questions/2, 'difficulty': a.difficulty} for a in attempts]
        insights = adaptive_engine.get_insights(user_id, history)

        insights['points'] = user.points
        insights['subscription'] = user.subscription
        insights['total_attempts'] = len(attempts)

        return jsonify(insights)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/playground/<quiz_id>', methods=['GET'])
def get_playground_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found'}), 404

        return jsonify({
            'id': quiz.id,
            'quiz_id': quiz.id,
            'questions': json.loads(quiz.questions_json),
            'difficulty': quiz.difficulty
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
