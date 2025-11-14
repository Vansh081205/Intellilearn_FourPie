from flask import Blueprint, request, jsonify
import re
import requests
from bs4 import BeautifulSoup
from app_modules.models import db, User
from ai_engine import generate_summary, generate_quiz

other_bp = Blueprint('other', __name__, url_prefix='/api')

def get_or_create_user(user_id):
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

@other_bp.route('/eli5', methods=['POST'])
def get_eli5_explanation():
    try:
        data = request.json
        doc_id = data['doc_id']

        from app_modules.models import Document
        doc = Document.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        from ai_engine import explain_eli5
        explanation = explain_eli5(doc.summary)
        return jsonify({'explanation': explanation})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@other_bp.route('/scrape-url', methods=['POST'])
def scrape_url():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({'error': 'No URL provided'}), 400

        html = requests.get(url, timeout=20).text
        soup = BeautifulSoup(html, 'html.parser')

        for tag in soup(['script', 'style', 'header', 'footer', 'nav']):
            tag.extract()

        text = soup.get_text(separator=' ')
        text = re.sub(r'\s+', ' ', text).strip()

        if not text or len(text) < 400:
            return jsonify({'error': 'Could not extract enough text'}), 400

        summary = generate_summary(text, 'medium')
        quiz = generate_quiz(text, 'medium', num_questions=5)

        return jsonify({'summary': summary, 'quiz': quiz, 'source_url': url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@other_bp.route('/user/profile/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        user = get_or_create_user(user_id)
        return jsonify({
            'user_id': user.id,
            'points': user.points,
            'subscription': user.subscription
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@other_bp.route('/subscription/plans', methods=['GET'])
def get_subscription_plans():
    plans = [
        {
            'id': 'free',
            'name': 'Free',
            'price': 0,
            'interval': 'forever',
            'features': ['5 documents/month', 'Basic quizzes', 'Standard support']
        },
        {
            'id': 'basic',
            'name': 'Basic',
            'price': 9.99,
            'interval': 'month',
            'features': ['50 documents/month', 'Advanced quizzes', 'Priority support', 'Knowledge graphs']
        },
        {
            'id': 'pro',
            'name': 'Pro',
            'price': 19.99,
            'interval': 'month',
            'features': ['Unlimited documents', 'All features', '24/7 support', 'Multiplayer']
        }
    ]
    return jsonify({'plans': plans})

@other_bp.route('/subscription/<user_id>', methods=['POST'])
def subscribe(user_id):
    try:
        user = get_or_create_user(user_id)
        data = request.json
        plan_id = data.get('plan_id')

        if plan_id not in ['free', 'basic', 'pro']:
            return jsonify({'error': 'Invalid plan'}), 400

        user.subscription = plan_id
        bonus_points = {'free': 100, 'basic': 500, 'pro': 2000}
        user.points += bonus_points.get(plan_id, 0)
        db.session.commit()

        return jsonify({
            'success': True,
            'subscription': user.subscription,
            'points': user.points
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@other_bp.route('/student/generate-id', methods=['POST'])
def generate_student_id():
    """Generate a unique student ID"""
    try:
        from app_modules.utils.helpers import generate_unique_id
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        student_id = generate_unique_id('S', 5)
        print(f"✅ Generated Student ID: {student_id} for {email}")

        return jsonify({
            'studentId': student_id,
            'email': email,
            'message': 'Student ID generated successfully'
        })
    except Exception as e:
        print(f"❌ Error generating student ID: {e}")
        return jsonify({'error': str(e)}), 500

@other_bp.route('/teacher/generate-id', methods=['POST'])
def generate_teacher_id():
    """Generate a unique teacher ID"""
    try:
        from app_modules.utils.helpers import generate_unique_id
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        teacher_id = generate_unique_id('T', 5)
        print(f"✅ Generated Teacher ID: {teacher_id} for {email}")

        return jsonify({
            'teacherId': teacher_id,
            'email': email,
            'message': 'Teacher ID generated successfully'
        })
    except Exception as e:
        print(f"❌ Error generating teacher ID: {e}")
        return jsonify({'error': str(e)}), 500

@other_bp.route('/debug/gemini', methods=['GET'])
def debug_gemini():
    """Test Gemini connection"""
    from app_modules.services.gemini_service import GeminiService
    result = GeminiService.test_connection()
    return jsonify(result)
