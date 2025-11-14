<<<<<<< HEAD
from datetime import datetime
=======
>>>>>>> firebender
import os
import uuid
import re
import json
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
import PyPDF2
from bs4 import BeautifulSoup
import requests
<<<<<<< HEAD
from flask import request, jsonify
from flask_socketio import emit
from sqlalchemy import func, case
from datetime import datetime, timedelta
=======
>>>>>>> firebender

# Import your existing AI modules
from ai_engine import generate_summary, generate_quiz, explain_eli5
from adaptive_logic import AdaptiveEngine

import google.generativeai as genai
from dotenv import load_dotenv
import os

# =========================================================================
# =========== FLASK APP & DATABASE CONFIGURATION ==========================
# =========================================================================

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'intellilearn.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")
adaptive_engine = AdaptiveEngine()

# =========================================================================
# =========== DATABASE MODELS =============================================
# =========================================================================


class User(db.Model):
    """
    Stores Clerk user_id and app-specific data (points, subscription).
    Clerk handles authentication, we just reference their ID.
    """
    id = db.Column(db.String(100), primary_key=True)  # Clerk User ID
    role = db.Column(db.String(20), default='student')  # NEW: 'student' or 'teacher'
    teacher_id = db.Column(db.String(50), unique=True, nullable=True)  # NEW: Stores both teacher and student IDs
    points = db.Column(db.Integer, default=100)
    subscription = db.Column(db.String(50), default='free')
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    documents = db.relationship('Document', backref='author', lazy=True, cascade="all, delete-orphan")
    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy=True, cascade="all, delete-orphan")
    enrollments = db.relationship('CourseEnrollment', backref='student', lazy=True)

class Teacher(db.Model):
    """Stores teacher information"""
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    courses = db.relationship('Course', backref='instructor', lazy=True)

class Course(db.Model):
    """Stores courses created by teachers"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    enrollments = db.relationship('CourseEnrollment', backref='course', lazy=True)

class CourseEnrollment(db.Model):
    """Tracks student enrollments in courses"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)  # 0-100
    enrolled_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'course_id': self.course_id,
            'progress': self.progress,
            'enrolled_at': self.enrolled_at.isoformat()
        }

class Document(db.Model):
    """Stores uploaded documents"""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    text_content = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    quiz = db.relationship('Quiz', backref='document', uselist=False, cascade="all, delete-orphan")

class Quiz(db.Model):
    """Stores generated quizzes"""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    difficulty = db.Column(db.String(20), nullable=False)
    questions_json = db.Column(db.Text, nullable=False)  # JSON string of questions
    document_id = db.Column(db.String(36), db.ForeignKey('document.id'), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class QuizAttempt(db.Model):
    """Tracks individual quiz attempts for adaptive learning"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    difficulty = db.Column(db.String(20))
    study_time = db.Column(db.String(10))
    completed_at = db.Column(db.DateTime, server_default=db.func.now())

# Add this to your DATABASE MODELS section (after Quiz model)

class ChatMessage(db.Model):
    """Stores chat conversation history"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    # Relationship
    user = db.relationship('User', backref=db.backref('chat_messages', lazy=True))
<<<<<<< HEAD
# Add these models to your app.py

class Course(db.Model):
    """Stores courses created by teachers or platform"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    instructor = db.Column(db.String(255), nullable=False)
    thumbnail = db.Column(db.String(10), default='📚')  # Emoji
    color = db.Column(db.String(50), default='from-blue-500 to-indigo-600')
    total_lessons = db.Column(db.Integer, default=0)
    duration = db.Column(db.String(50))
    level = db.Column(db.String(20), default='Beginner')
    rating = db.Column(db.Float, default=0.0)
    students_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    enrollments = db.relationship('CourseEnrollment', backref='course_ref', lazy=True, cascade="all, delete-orphan")
    lessons = db.relationship('Lesson', backref='course', lazy=True, cascade="all, delete-orphan")

class Lesson(db.Model):
    """Individual lessons within a course"""
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    week = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    order = db.Column(db.Integer, default=0)
    duration = db.Column(db.String(20))  # e.g., "15 min"
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class CourseEnrollment(db.Model):
    """Tracks student enrollments in courses"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)  # 0-100
    completed_lessons = db.Column(db.Integer, default=0)
    last_accessed = db.Column(db.DateTime)
    enrolled_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    completed_lesson_ids = db.relationship('CompletedLesson', backref='enrollment', lazy=True, cascade="all, delete-orphan")

class CompletedLesson(db.Model):
    """Track which lessons a student has completed"""
    id = db.Column(db.Integer, primary_key=True)
    enrollment_id = db.Column(db.Integer, db.ForeignKey('course_enrollment.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lesson.id'), nullable=False)
    completed_at = db.Column(db.DateTime, server_default=db.func.now())
=======
>>>>>>> firebender
# =========================================================================
# =========== HELPER FUNCTIONS ============================================
# =========================================================================

def get_or_create_user(user_id):
    """Get existing user or create new one with Clerk ID"""
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

# In-memory storage for real-time game rooms (temporary data)
rooms = {}

def get_leaderboard(room_code):
    """Get sorted leaderboard for a room"""
    if room_code in rooms:
        return sorted(rooms[room_code]['players'].values(), key=lambda p: p['score'], reverse=True)
    return []

# =========================================================================
# =========== HTTP API ROUTES =============================================
# =========================================================================

@app.route('/api/upload', methods=['POST'])
def upload_document():
    try:
        user_id = request.form.get('user_id')  # From Clerk
        if not user_id:
            return jsonify({'error': 'User authentication required'}), 401

        user = get_or_create_user(user_id)
        file = request.files['file']
        difficulty = request.form.get('difficulty', 'medium')

        # Extract text
        if file.filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
            text = "".join(page.extract_text() for page in pdf_reader.pages[:10])
        else:
            text = file.read().decode('utf-8')

        summary = generate_summary(text, difficulty)

        # Save to database
        new_doc = Document(
            filename=file.filename,
            text_content=text,
            summary=summary,
            difficulty=difficulty,
            author=user
        )
        db.session.add(new_doc)
        db.session.commit()

        return jsonify({
            'doc_id': new_doc.id,
            'summary': summary,
            'filename': file.filename
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST'])
def create_quiz():
    try:
        data = request.json
        doc_id = data['doc_id']
        user_id = data.get('user_id', 'demo_user')
        requested_difficulty = data.get('difficulty', None)

        doc = Document.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        # Use adaptive difficulty or requested
        if requested_difficulty and requested_difficulty in ['easy', 'medium', 'hard']:
            difficulty = requested_difficulty
        else:
            attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
            history = [{'correct': a.score > a.total_questions/2, 'difficulty': a.difficulty} for a in attempts]
            difficulty = adaptive_engine.calculate_difficulty(user_id, history)

        # Delete old quiz if exists
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

@app.route('/api/submit-answer', methods=['POST'])
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

        # Award points
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

@app.route('/api/dashboard/<user_id>', methods=['GET'])
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

@app.route('/api/documents/<user_id>', methods=['GET'])
def load_documents(user_id):
    """
    Fetches all documents for a user, including calculated quiz statistics 
    (quizzes_taken, average_score, study_time).
    Corresponds to the frontend's loadDocuments function.
    """
    try:
        # Check if user exists first (optional, but good practice)
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # 1. Subquery to calculate stats per document
        # We need to calculate quizzes_taken, average_score, and sum of study_time
        # *NOTE*: The provided database schema doesn't have a 'study_time' 
        # column on Document or QuizAttempt. I will assume for demonstration 
        # that 'study_time' is a field on QuizAttempt for now, but you may need 
        # to adjust your model if this is not the case.
        
        # Aggregate quiz attempt data per quiz
        print("Before 1")
        quiz_stats = db.session.query(
            Quiz.document_id.label('doc_id'),
            func.count(QuizAttempt.id).label('quizzes_taken'),
            func.avg(QuizAttempt.score).label('average_score'),
            # Assuming 'study_time' is a column on QuizAttempt
            func.sum(QuizAttempt.study_time).label('total_study_time') # <--- Adjust model if needed
        ).join(QuizAttempt, QuizAttempt.quiz_id == Quiz.id).group_by(Quiz.document_id).subquery()
        print("before 2")

        # 2. Main query: Fetch documents and left-join with the calculated stats
        documents_with_stats = db.session.query(
            Document,
            quiz_stats.c.quizzes_taken,
            quiz_stats.c.average_score,
            quiz_stats.c.total_study_time
        ).filter(Document.user_id == user_id).outerjoin(
            quiz_stats, Document.id == quiz_stats.c.doc_id
        ).all()
        print("before 3")

        if not documents_with_stats:
            # Return 404 if no documents, matching the frontend's exception handling for a 404 status
            return jsonify({'documents': []}), 404

        # 3. Format the results
        documents_list = []
        for doc, taken, avg, study in documents_with_stats:
            documents_list.append({
                'doc_id': doc.id,
                'filename': doc.filename,
                'summary': doc.summary,
                'difficulty': doc.difficulty,
                'user_id': doc.user_id,
                'uploaded_at': doc.created_at.isoformat(),
                'has_quiz': doc.quiz is not None, # Check if a Quiz exists
                'quizzes_taken': int(taken) if taken else 0,
                'average_score': float(f'{avg:.2f}') if avg else 0.0,
                'study_time': int(study) if study else 0, # Assuming study_time is stored in minutes/seconds
            })

        return jsonify({'documents': documents_list}), 200

    except Exception as e:
        print(f"Error loading documents: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/documents', methods=['POST'])
def upload_lib_document():
    """
    Handles the upload of a new document.
    Corresponds to the logic preceding handleUploadSuccess.
    
    NOTE: The full implementation of file handling, text extraction, 
    summary generation, and quiz creation is complex and not fully shown 
    here, but the structure for the route is provided.
    """
    # Assuming user_id is passed in the request body/form data
    user_id = request.form.get('user_id') 
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    filename = file.filename

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # 1. Process the file (e.g., PDF extraction)
        # For simplicity, let's assume 'extract_text_content' is a function
        # that handles reading the file content.
        # text_content = extract_text_content(file) # <--- Placeholder
        text_content = "Extracted content from " + filename # Dummy content
        
        # 2. Call external AI service for summary (e.g., via a worker queue)
        # summary = generate_summary(text_content) # <--- Placeholder
        summary = f"Summary for {filename} is generated successfully." # Dummy summary

        # 3. Create and save the new Document object
        new_doc = Document(
            filename=filename,
            text_content=text_content,
            summary=summary,
            user_id=user_id,
            difficulty='medium' # Default
        )
        db.session.add(new_doc)
        db.session.commit()
        
        # The frontend expects a response with doc_id, filename, and summary
        return jsonify({
            'message': 'Document processing started',
            'doc_id': new_doc.id,
            'filename': new_doc.filename,
            'summary': new_doc.summary
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error uploading document: {e}")
        return jsonify({'error': 'Failed to process document'}), 500


@app.route('/api/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """
    Deletes a specific document by its ID.
    Corresponds to the frontend's handleDeleteDocument function.
    """
    try:
        document = Document.query.get(doc_id)
        
        if not document:
            return jsonify({'message': 'Document not found'}), 404

        # The cascade="all, delete-orphan" on the relationships 
        # (like 'quiz' and documents on 'user') will handle deleting 
        # related Quiz and QuizAttempts implicitly via SQLAlchemy.
        
        db.session.delete(document)
        db.session.commit()
        
        return jsonify({'message': 'Document deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting document: {e}")
        return jsonify({'error': 'Failed to delete document'}), 500 

@app.route('/api/eli5', methods=['POST'])
def get_eli5_explanation():
    try:
        data = request.json
        doc_id = data['doc_id']

        doc = Document.query.get(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404

        explanation = explain_eli5(doc.summary)
        return jsonify({'explanation': explanation})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/playground/<quiz_id>', methods=['GET'])
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

@app.route('/api/scrape-url', methods=['POST'])
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

@app.route('/api/user/profile/<user_id>', methods=['GET'])
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

@app.route('/api/subscription/plans', methods=['GET'])
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

@app.route('/api/subscription/<user_id>', methods=['POST'])
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

# =========================================================================
# =========== STUDENT & TEACHER ID GENERATION =============================
# =========================================================================

import random
import string


def generate_unique_id(prefix='S', length=5):
    """Generate a unique ID with given prefix (S for Student, T for Teacher)"""
    while True:
        # Generate random alphanumeric string
        random_part = ''.join(random.choices(string.digits, k=length))
        unique_id = f"{prefix}{random_part}"

        # Check if ID already exists in the database
        # For simplicity, we're just returning the ID
        # In production, you'd check against existing records
        return unique_id


@app.route('/api/student/generate-id', methods=['POST'])
def generate_student_id():
    """Generate a unique student ID"""
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Generate unique student ID
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


@app.route('/api/teacher/generate-id', methods=['POST'])
def generate_teacher_id():
    """Generate a unique teacher ID"""
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        # Generate unique teacher ID
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


# =========================================================================
# =========== SOCKET.IO REAL-TIME MULTIPLAYER =============================
# =========================================================================

@socketio.on('create_game')
def handle_create_game(data):
    username = data.get('username')
    quiz_id = data.get('quiz_id')
    user_id = data.get('user_id')

    quiz = Quiz.query.get(quiz_id)
    if not (username and user_id and quiz):
        emit('error', {'message': 'Invalid data or quiz not found'})
        return

    room_code = str(uuid.uuid4())[:6].upper()
    host_sid = request.sid
    get_or_create_user(user_id)

    rooms[room_code] = {
        'quiz_id': quiz.id,
        'questions': json.loads(quiz.questions_json),
        'host_sid': host_sid,
        'state': 'lobby',
        'current_question_index': -1,
        'players': {host_sid: {'user_id': user_id, 'username': username, 'score': 0}}
    }

    join_room(room_code)
    emit('game_created', {'room_code': room_code, 'quiz_id': quiz.id})
    emit('lobby_update', {'players': get_leaderboard(room_code)})

@socketio.on('join_game')
def handle_join_game(data):
    username = data.get('username')
    room_code = data.get('room_code')
    user_id = data.get('user_id')
    player_sid = request.sid

    if not (username and user_id and room_code and room_code in rooms):
        emit('error', {'message': 'Invalid data or room code'})
        return

    if rooms[room_code]['state'] != 'lobby':
        emit('error', {'message': 'Game already started'})
        return

    get_or_create_user(user_id)
    join_room(room_code)
    rooms[room_code]['players'][player_sid] = {'user_id': user_id, 'username': username, 'score': 0}

    emit('player_joined', {'username': username}, room=room_code)
    emit('lobby_update', {'players': get_leaderboard(room_code)}, room=room_code)

@socketio.on('start_game')
def handle_start_game(data):
    room_code = data.get('room_code')
    if room_code not in rooms or rooms[room_code]['host_sid'] != request.sid:
        emit('error', {'message': 'Not authorized'})
        return

    rooms[room_code]['state'] = 'playing'
    emit('game_started', room=room_code)
    send_next_question(room_code)

def send_next_question(room_code):
    room = rooms.get(room_code)
    if not room: return

    room['current_question_index'] += 1
    q_index = room['current_question_index']

    if q_index < len(room['questions']):
        current_q = room['questions'][q_index].copy()
        del current_q['correct']
        del current_q['explanation']
        emit('new_question', {
            'question': current_q,
            'question_number': q_index + 1,
            'total_questions': len(room['questions'])
        }, room=room_code)
    else:
        room['state'] = 'finished'
        try:
            # Save scores to database
            for player_data in room['players'].values():
                user = User.query.get(player_data['user_id'])
                if user:
                    user.points += player_data['score']
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Error saving scores: {e}")

        emit('game_over', {'leaderboard': get_leaderboard(room_code)}, room=room_code)

@socketio.on('player_answer')
def handle_player_answer(data):
    room_code = data.get('room_code')
    answer = data.get('answer')
    player_sid = request.sid

    room = rooms.get(room_code)
    if not (room and room['state'] == 'playing' and player_sid in room['players']):
        return

    q_index = room['current_question_index']
    correct_answer = room['questions'][q_index]['correct']

    if answer == correct_answer:
        room['players'][player_sid]['score'] += 10
        emit('leaderboard_update', {'leaderboard': get_leaderboard(room_code)}, room=room_code)

@socketio.on('disconnect')
def handle_disconnect():
    player_sid = request.sid
    for room_code, room_data in list(rooms.items()):
        if player_sid in room_data['players']:
            del rooms[room_code]['players'][player_sid]
            if player_sid == room_data['host_sid'] or not room_data['players']:
                del rooms[room_code]
            else:
                emit('lobby_update', {'players': get_leaderboard(room_code)}, room=room_code)
            break

# =========================================================================
# =========== MAIN EXECUTION ==============================================
# =========================================================================
# =========================================================================
# =========== ENHANCED AI CHATBOT WITH PERSONALITY ========================
# =========================================================================

# =========================================================================
# =========== UNIVERSAL AI CHATBOT - GEMINI (FIXED MODEL NAME) ===========
# =========================================================================


# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
print(f"🔑 Gemini API Key: {'Loaded ✓' if GEMINI_API_KEY else 'Missing ✗'}")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini configured successfully!")

@app.route('/api/chat/ask', methods=['POST'])
def chat_ask_question():
    """Universal AI study assistant - WITH MESSAGE SAVING"""
    try:
        data = request.json
        user_id = data.get('user_id')
        question = data.get('question', '').strip()
        doc_id = data.get('doc_id')

        if not user_id or not question:
            return jsonify({'error': 'Missing required fields'}), 400

        print(f"\n💬 Question: {question}")

        # Ensure user exists
        user = get_or_create_user(user_id)

        # Get document context if available
        document_context = ""
        if doc_id:
            try:
                doc = Document.query.get(doc_id)
                if doc:
                    document_context = doc.text_content[:2000]
            except Exception as e:
                print(f"⚠️ Document error: {e}")

        # Try Gemini AI
        answer = None
        if GEMINI_API_KEY:
            try:
                answer = get_gemini_response(question, document_context)
                print("✅ Gemini 2.5 response")
            except Exception as e:
                print(f"❌ Gemini error: {e}")

        # Fallback if Gemini fails
        if not answer:
            answer = get_fallback_response(question, document_context)
            print("📝 Fallback response")

        # ✅ SAVE MESSAGE TO DATABASE
        try:
            chat_message = ChatMessage(
                user_id=user_id,
                question=question,
                answer=answer
            )
            db.session.add(chat_message)
            db.session.commit()
            print("💾 Message saved to database")
        except Exception as e:
            print(f"⚠️ Failed to save message: {e}")
            db.session.rollback()

        return jsonify({
            'answer': answer,
            'question': question,
            'timestamp': chat_message.timestamp.isoformat() if chat_message else None
        })

    except Exception as e:
        print(f"💥 Fatal error: {e}")
        db.session.rollback()
        return jsonify({'answer': 'I encountered an error. Please try again!'}), 200


def get_gemini_response(question, document_context=""):
    """
    Get response from Google Gemini AI
    """

    # Build the prompt
    prompt = f"""You are IntelliLearn AI, a friendly and knowledgeable study assistant for students of all ages.

GUIDELINES:
- Answer questions from ANY subject (Math, Science, History, Literature, Geography, etc.)
- Explain concepts clearly with examples
- Use markdown formatting (**, *, bullet points)
- Add emojis for engagement (but don't overuse)
- Keep answers 2-4 paragraphs unless detailed explanation is needed
- For math problems, show step-by-step calculations
- Be encouraging and supportive
- End with a helpful follow-up question

STUDENT'S QUESTION: {question}"""

    if document_context:
        prompt += f"\n\nSTUDENT'S STUDY MATERIAL:\n{document_context}\n\nIf the question relates to this material, reference it in your answer."

    # Initialize model with CORRECT name
    model = genai.GenerativeModel('gemini-2.5-flash')

    # Generate content
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=0.7,
            top_p=0.95,
            top_k=40,
            max_output_tokens=1000,
        )
    )

    answer = response.text.strip()

    # Add footer
    answer += "\n\n💡 *Have another question? I'm here to help!*"

    return answer


def get_fallback_response(question, document_context=""):
    """Smart fallback responses when AI is unavailable"""

    q = question.lower().strip()

    # === GREETINGS ===
    if any(w in q for w in ['hello', 'hi', 'hey', 'greetings']):
        return """Hello! 👋 I'm **IntelliLearn AI**, your study companion!

I can help with:
📐 Math • 🔬 Science • 📚 History • 📖 Literature • 🌍 Geography • 💻 Computer Science

**From elementary to university level!**

What would you like to learn today?"""

    # === GRATITUDE ===
    if any(w in q for w in ['thank', 'thanks', 'thx']):
        return "You're very welcome! 😊 Keep asking questions - that's how we learn best! What else can I help you with?"

    # === PERSONAL QUESTIONS ===
    if 'how are you' in q:
        return "I'm doing great! 🤖✨ Ready to help you learn anything. What topic interests you today?"

    if 'who are you' in q or 'what is your name' in q:
        return "I'm IntelliLearn AI, powered by Google Gemini! Your 24/7 study assistant for ANY subject. What can I help you learn? 🎓"

    # === MULTIPLICATION TABLES ===
    table_match = re.search(r'table\s+(?:of\s+)?(\d+)|(\d+)\s+table', q)
    if table_match:
        num = int(table_match.group(1) or table_match.group(2))
        if num > 100:
            return "That's quite large! Try a number between 1-20 for practice! 😊"

        table = '\n'.join([f"{num} × {i:2d} = {num * i:4d}" for i in range(1, 11)])

        tips = {
            2: "💡 **Tip:** Just double the number!",
            5: "💡 **Pattern:** Always ends in 0 or 5!",
            9: "💡 **Magic:** Digits always sum to 9!",
            10: "💡 **Easy:** Just add a zero!"
        }
        tip = tips.get(num, "💡 Practice makes perfect!")

        return f"""📊 **Multiplication Table for {num}:**
        {table}
        
{tip}

Want another table or a different question?"""

    # === MATH CALCULATIONS ===
    # Multiplication
    mult = re.search(r'(\d+)\s*[x×*]\s*(\d+)', q)
    if mult:
        a, b = int(mult.group(1)), int(mult.group(2))
        return f"""🧮 **{a} × {b} = {a * b}**

💡 Think of it as: {a} groups of {b}!

Need another calculation?"""

    # Addition
    add = re.search(r'(\d+)\s*\+\s*(\d+)', q)
    if add:
        a, b = int(add.group(1)), int(add.group(2))
        return f"➕ **{a} + {b} = {a + b}**\n\nAnother one?"

    # Subtraction
    sub = re.search(r'(\d+)\s*-\s*(\d+)', q)
    if sub:
        a, b = int(sub.group(1)), int(sub.group(2))
        return f"➖ **{a} - {b} = {a - b}**\n\nMore practice?"

    # Division
    div = re.search(r'(\d+)\s*[/÷]\s*(\d+)', q)
    if div:
        a, b = int(div.group(1)), int(div.group(2))
        if b == 0:
            return "❌ Cannot divide by zero! Try a different divisor."
        result = a / b
        if result.is_integer():
            return f"➗ **{a} ÷ {b} = {int(result)}**"
        return f"➗ **{a} ÷ {b} = {result:.2f}**"

    # === HELP MENU ===
    if 'help' in q or 'what can you do' in q:
        return """🎓 **I'm Your Universal Study Assistant!**

**📚 I can help with ANY subject:**

**Math** 📐
• Arithmetic, Algebra, Geometry
• Calculus, Statistics

**Science** 🔬
• Physics, Chemistry, Biology
• Environmental Science

**Humanities** 📖
• History, Geography
• Literature, Languages

**Technology** 💻
• Computer Science
• Programming

**Just ask naturally!**
• "Explain photosynthesis"
• "What is Newton's first law?"
• "Solve 2x + 5 = 15"
• "Who wrote Romeo and Juliet?"

What would you like to learn? 😊"""

    # === DOCUMENT CONTEXT ===
    if document_context:
        preview = document_context[:400]
        return f"""📄 **From your study material:**

{preview}...

Ask me a specific question about this content!

What would you like me to explain?"""

    # === DEFAULT RESPONSE ===
    return """I'm here to help you learn! 😊

**Try asking:**
• Math: *"table of 7"*, *"solve 2x + 5 = 15"*
• Science: *"explain photosynthesis"*, *"Newton's laws"*
• History: *"What caused World War 2?"*
• Literature: *"Who was Shakespeare?"*

**Or say "help" to see all my features!**

What topic are you studying?"""


# Debug endpoint (keep this for testing)
@app.route('/api/debug/gemini', methods=['GET'])
def debug_gemini():
    """Test Gemini connection"""
    try:
        if not GEMINI_API_KEY:
            return jsonify({
                'status': 'error',
                'message': 'API key not found',
                'solution': 'Add GEMINI_API_KEY to .env file'
            })

        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Say 'Hello! I am working perfectly!'")

        return jsonify({
            'status': 'success',
            'message': 'Gemini is working!',
            'model': 'gemini-2.5-flash',
            'test_response': response.text
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

# =========================================================================
# =========== CHAT HISTORY MANAGEMENT =====================================
# =========================================================================

@app.route('/api/chat/history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Get all chat messages for a user"""
    try:
        # Get optional limit parameter (default: last 50 messages)
        limit = request.args.get('limit', 50, type=int)

        # Fetch messages from database
        messages = ChatMessage.query\
            .filter_by(user_id=user_id)\
            .order_by(ChatMessage.timestamp.desc())\
            .limit(limit)\
            .all()

        # Convert to list (reverse to show oldest first)
        chat_history = [{
            'id': msg.id,
            'question': msg.question,
            'answer': msg.answer,
            'timestamp': msg.timestamp.isoformat(),
            'type': 'history'  # Mark as loaded from history
        } for msg in reversed(messages)]

        print(f"📚 Loaded {len(chat_history)} messages for user {user_id}")

        return jsonify({
            'messages': chat_history,
            'count': len(chat_history)
        })

    except Exception as e:
        print(f"❌ Error loading chat history: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/clear/<user_id>', methods=['DELETE'])
def clear_chat_history(user_id):
    """Clear all chat history for a user (on logout)"""
    try:
        # Delete all messages for this user
        deleted = ChatMessage.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        print(f"🗑️ Cleared {deleted} messages for user {user_id}")

        return jsonify({
            'success': True,
            'deleted_count': deleted,
            'message': f'Cleared {deleted} messages'
        })

    except Exception as e:
        print(f"❌ Error clearing chat history: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/delete/<int:message_id>', methods=['DELETE'])
def delete_single_message(message_id):
    """Delete a single message (optional feature)"""
    try:
        message = ChatMessage.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404

        db.session.delete(message)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Message deleted'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/knowledge-graph/generate', methods=['POST'])
def generate_knowledge_graph():
    try:
        doc_id = request.json.get('doc_id')
        if not doc_id: return jsonify({'error': 'Document ID is required'}), 400

        doc = Document.query.get(doc_id)
        if not doc: return jsonify({'error': f'Document with ID {doc_id} not found'}), 404

        print(f"📊 Generating graph for: {doc.filename}")

        concepts = []
        generator_type = 'simple'
        if GEMINI_API_KEY:
            try:
                concepts = extract_concepts_with_gemini(doc.text_content)
                generator_type = 'ai'
                print(f"✅ AI extracted {len(concepts)} concepts")
            except Exception as e:
                print(f"❌ Gemini failed for graph: {e}. Using simple fallback.")
                concepts = extract_concepts_simple(doc.text_content)
        else:
            concepts = extract_concepts_simple(doc.text_content)

        return jsonify(build_graph_structure(concepts, doc.filename, generator_type))

    except Exception as e:
        print(f"💥 Fatal Error in knowledge graph: {e}")
        return jsonify({'error': str(e)}), 500

def extract_concepts_with_gemini(text):
    prompt = f"""From the text below, extract the 5-7 most important key concepts.
TEXT: {text[:3000]}
Return ONLY a valid JSON array of objects. Each object must have "name" (string, 2-4 words max) and "description" (string, 1 brief sentence).
Example: [{{"name": "Machine Learning", "description": "A field of AI focused on training models from data."}}]"""

    model = genai.GenerativeModel('models/gemini-2.5-flash')
    response = model.generate_content(prompt, generation_config={'temperature': 0.2, 'max_output_tokens': 800})

    # Robust JSON parsing
    text_response = response.text.strip()
    json_match = re.search(r'\[.*\]', text_response, re.DOTALL)
    if not json_match:
        raise ValueError("AI did not return a valid JSON array for concepts.")
    return json.loads(json_match.group(0))

def extract_concepts_simple(text):
    words = re.findall(r'\b[A-Z][a-z]{3,}(?:\s+[A-Z][a-z]+)*\b', text)
    word_freq = {}
    for word in words:
        if word not in ['The', 'This', 'That', 'These', 'There']:
            word_freq[word] = word_freq.get(word, 0) + 1
    top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:6]
    return [{'name': word, 'description': f'A key concept mentioned {freq} times in the document.'} for word, freq in top_words]

def build_graph_structure(concepts, filename, generator_type):
    colors = ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']
    nodes = [{'id': 'main', 'label': filename.split('.')[0][:30], 'level': 0, 'color': '#3B82F6', 'size': 50}]
    links = []

    for idx, concept in enumerate(concepts[:7]):
        node_id = f'node_{idx}'
        nodes.append({
            'id': node_id, 'label': concept['name'][:30], 'level': 1,
            'color': colors[idx % len(colors)], 'size': 35,
            'definition': concept.get('description', 'A key concept from the document.')
        })
        links.append({'source': 'main', 'target': node_id})

    return {'nodes': nodes, 'links': links, 'generated_by': generator_type}


# In app.py

@app.route('/api/knowledge-graph/explain/<concept>', methods=['POST'])
def explain_concept(concept):
    """
    Get AI explanation for a concept - WITH ROBUST ERROR HANDLING
    """
    try:
        print(f"💭 Explaining concept: {concept}")

        context = ""
        doc_id = request.json.get('doc_id')
        if doc_id:
            doc = Document.query.get(doc_id)
            if doc:
                context = doc.text_content[:2000]

        # Try to get AI explanation
        if GEMINI_API_KEY:
            try:
                prompt = f"""Explain this concept for a student in 2-3 clear sentences. Also provide 3 key bullet points.
CONCEPT: {concept}
CONTEXT: {context}
Return ONLY a valid JSON object with "explanation" (string) and "keyPoints" (array of strings).
Example: {{"explanation": "...", "keyPoints": ["...", "...", "..."]}}"""

                model = genai.GenerativeModel('models/gemini-2.5-flash')
                response = model.generate_content(prompt)

                # ✅ ROBUST JSON PARSING
                text_response = response.text.strip()
                json_match = re.search(r'\{.*\}', text_response, re.DOTALL)

                if json_match:
                    explanation_data = json.loads(json_match.group(0))
                    print(f"✅ AI explanation generated for '{concept}'")
                    return jsonify(explanation_data)
                else:
                    # If JSON not found, use the raw text as the explanation
                    print(f"⚠️ AI returned non-JSON. Using raw text.")
                    return jsonify({
                        'explanation': text_response,
                        'keyPoints': ["AI provided a direct answer.", "Review this concept in your material.", "Ask me a follow-up question!"]
                    })
            except Exception as e:
                print(f"❌ Gemini explanation failed: {e}")
                # Fall through to the basic fallback

        # Fallback if AI fails or no key
        print("📝 Using fallback explanation.")
        return jsonify({
            'explanation': f'{concept} is a core idea in your study material. It connects several key themes and is important to understand fully.',
            'keyPoints': [ 'This is a fundamental topic.', 'Review the related sections in your document.', 'Try to apply this concept with practice problems.' ]
        })

    except Exception as e:
        print(f"💥 Fatal error explaining concept: {e}")
        return jsonify({'error': str(e)}), 500
<<<<<<< HEAD
=======

>>>>>>> firebender
def migrate_database_schema():
    """Add missing columns to existing database - SQLite compatible"""
    import sqlite3

    db_path = os.path.join(basedir, 'intellilearn.db')

    # Check if database exists
    if not os.path.exists(db_path):
        print("📊 New database - no migration needed")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check User table columns
        cursor.execute("PRAGMA table_info(user)")
        user_columns = [col[1] for col in cursor.fetchall()]
        print(f"📋 Existing User columns: {user_columns}")

        migrations_applied = False

        # Add email column
        if 'email' not in user_columns:
            print("🔧 Adding 'email' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN email VARCHAR(255)")
            migrations_applied = True

        # Add role column
        if 'role' not in user_columns:
            print("🔧 Adding 'role' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN role VARCHAR(20) DEFAULT 'student'")
            cursor.execute("UPDATE user SET role = 'student' WHERE role IS NULL")
            migrations_applied = True

        # Add teacher_id column
        if 'teacher_id' not in user_columns:
            print("🔧 Adding 'teacher_id' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN teacher_id VARCHAR(50)")
            migrations_applied = True

<<<<<<< HEAD
        # ✅ ADD STREAK COLUMNS
        if 'streak' not in user_columns:
            print("🔧 Adding 'streak' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN streak INTEGER DEFAULT 0")
            cursor.execute("UPDATE user SET streak = 0 WHERE streak IS NULL")
            migrations_applied = True

        if 'longest_streak' not in user_columns:
            print("🔧 Adding 'longest_streak' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN longest_streak INTEGER DEFAULT 0")
            cursor.execute("UPDATE user SET longest_streak = 0 WHERE longest_streak IS NULL")
            migrations_applied = True

        if 'last_active' not in user_columns:
            print("🔧 Adding 'last_active' column to User table...")
            cursor.execute("ALTER TABLE user ADD COLUMN last_active DATETIME")
            migrations_applied = True

=======
>>>>>>> firebender
        if migrations_applied:
            conn.commit()
            print("✅ Database migration completed successfully!")
        else:
            print("✅ Database schema is up to date - no migration needed")

        conn.close()

    except Exception as e:
        print(f"❌ Migration error: {e}")
        print("💡 Tip: If error persists, delete intellilearn.db and restart")
<<<<<<< HEAD
# =========================================================================
# =========== USER STREAK MANAGEMENT ======================================
# =========================================================================

@app.route('/api/user/streak/<user_id>', methods=['GET'])
def get_user_streak(user_id):
    """Get user's current streak and activity stats"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'current_streak': 0,
                'last_active': None,
                'total_quizzes': 0,
                'longest_streak': 0
            }), 200
        
        # Calculate streak based on last activity
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        last_active = user.last_active.date() if user.last_active else None
        
        if not last_active:
            current_streak = 0
        elif last_active == today or last_active == today - timedelta(days=1):
            # User was active today or yesterday - streak continues
            current_streak = user.streak or 0
        else:
            # Streak broken
            current_streak = 0
            user.streak = 0
            db.session.commit()
        
        # Count total quizzes
        total_quizzes = QuizAttempt.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'current_streak': current_streak,
            'last_active': user.last_active.isoformat() if user.last_active else None,
            'total_quizzes': total_quizzes,
            'longest_streak': user.longest_streak or 0
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting streak: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/update-streak/<user_id>', methods=['POST'])
def update_user_streak(user_id):
    """Update user's streak when they complete an activity"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        from datetime import datetime, timedelta
        
        today = datetime.now().date()
        last_active = user.last_active.date() if user.last_active else None
        
        # Update streak logic
        if not last_active or last_active < today - timedelta(days=1):
            # Start new streak
            user.streak = 1
        elif last_active == today - timedelta(days=1):
            # Continue streak
            user.streak = (user.streak or 0) + 1
        # If last_active == today, don't increment (already counted for today)
        
        # Update longest streak
        if user.streak > (user.longest_streak or 0):
            user.longest_streak = user.streak
        
        user.last_active = datetime.now()
        db.session.commit()
        
        return jsonify({
            'current_streak': user.streak,
            'longest_streak': user.longest_streak,
            'message': 'Streak updated successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ Error updating streak: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
# =========================================================================
# =========== COURSE MANAGEMENT ROUTES ====================================
# =========================================================================

@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    """Get all available courses"""
    try:
        user_id = request.args.get('user_id')
        category = request.args.get('category', 'all')
        search = request.args.get('search', '').lower()
        
        # Base query
        query = Course.query
        
        # Apply filters
        if category != 'all':
            query = query.filter(Course.category == category)
        
        if search:
            query = query.filter(
                db.or_(
                    Course.title.ilike(f'%{search}%'),
                    Course.subject.ilike(f'%{search}%'),
                    Course.description.ilike(f'%{search}%')
                )
            )
        
        courses = query.all()
        
        # Get user enrollments if user_id provided
        enrolled_course_ids = set()
        if user_id:
            enrollments = CourseEnrollment.query.filter_by(user_id=user_id).all()
            enrolled_course_ids = {e.course_id for e in enrollments}
        
        courses_list = []
        for course in courses:
            enrollment = None
            if user_id and course.id in enrolled_course_ids:
                enrollment = CourseEnrollment.query.filter_by(
                    user_id=user_id, 
                    course_id=course.id
                ).first()
            
            courses_list.append({
                'id': course.id,
                'title': course.title,
                'subject': course.subject,
                'category': course.category,
                'description': course.description,
                'instructor': course.instructor,
                'thumbnail': course.thumbnail,
                'color': course.color,
                'totalLessons': course.total_lessons,
                'duration': course.duration,
                'level': course.level,
                'rating': course.rating,
                'students': course.students_count,
                'enrolled': enrollment is not None,
                'progress': enrollment.progress if enrollment else 0,
                'completedLessons': enrollment.completed_lessons if enrollment else 0,
                'lastAccessed': enrollment.last_accessed.isoformat() if enrollment and enrollment.last_accessed else None
            })
        
        return jsonify({'courses': courses_list}), 200
        
    except Exception as e:
        print(f"❌ Error fetching courses: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course_details(course_id):
    """Get detailed information about a specific course"""
    try:
        user_id = request.args.get('user_id')
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Get course lessons grouped by week
        lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.week, Lesson.order).all()
        
        # Group lessons by week
        syllabus = {}
        for lesson in lessons:
            if lesson.week not in syllabus:
                syllabus[lesson.week] = {
                    'week': lesson.week,
                    'lessons': [],
                    'total': 0,
                    'completed': 0
                }
            syllabus[lesson.week]['lessons'].append({
                'id': lesson.id,
                'title': lesson.title,
                'duration': lesson.duration,
                'order': lesson.order
            })
            syllabus[lesson.week]['total'] += 1
        
        # Get enrollment info if user is enrolled
        enrollment = None
        completed_lesson_ids = set()
        if user_id:
            enrollment = CourseEnrollment.query.filter_by(
                user_id=user_id, 
                course_id=course_id
            ).first()
            
            if enrollment:
                completed = CompletedLesson.query.filter_by(
                    enrollment_id=enrollment.id
                ).all()
                completed_lesson_ids = {c.lesson_id for c in completed}
        
        # Calculate completed lessons per week
        for week_data in syllabus.values():
            week_data['completed'] = sum(
                1 for lesson in week_data['lessons'] 
                if lesson['id'] in completed_lesson_ids
            )
        
        course_data = {
            'id': course.id,
            'title': course.title,
            'subject': course.subject,
            'category': course.category,
            'description': course.description,
            'instructor': course.instructor,
            'thumbnail': course.thumbnail,
            'color': course.color,
            'totalLessons': course.total_lessons,
            'duration': course.duration,
            'level': course.level,
            'rating': course.rating,
            'students': course.students_count,
            'enrolled': enrollment is not None,
            'progress': enrollment.progress if enrollment else 0,
            'completedLessons': enrollment.completed_lessons if enrollment else 0,
            'lastAccessed': enrollment.last_accessed.isoformat() if enrollment and enrollment.last_accessed else None,
            'syllabus': list(syllabus.values()),
            'skills': []  # You can add a skills table if needed
        }
        
        return jsonify(course_data), 200
        
    except Exception as e:
        print(f"❌ Error fetching course details: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/courses/<int:course_id>/enroll', methods=['POST'])
def enroll_in_course(course_id):
    """Enroll a user in a course"""
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Check if course exists
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        # Check if already enrolled
        existing = CourseEnrollment.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).first()
        
        if existing:
            return jsonify({'message': 'Already enrolled', 'enrollment': existing.id}), 200
        
        # Create enrollment
        enrollment = CourseEnrollment(
            user_id=user_id,
            course_id=course_id,
            progress=0,
            completed_lessons=0,
            last_accessed=datetime.now()
        )
        
        # Update course student count
        course.students_count += 1
        
        db.session.add(enrollment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'enrollment_id': enrollment.id,
            'message': 'Successfully enrolled in course'
        }), 201
        
    except Exception as e:
        print(f"❌ Error enrolling in course: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/courses/<int:course_id>/lessons', methods=['GET'])
def get_course_lessons(course_id):
    """Get all lessons for a course"""
    try:
        user_id = request.args.get('user_id')
        
        course = Course.query.get(course_id)
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        lessons = Lesson.query.filter_by(course_id=course_id).order_by(Lesson.week, Lesson.order).all()
        
        # Get completed lessons if user provided
        completed_lesson_ids = set()
        if user_id:
            enrollment = CourseEnrollment.query.filter_by(
                user_id=user_id,
                course_id=course_id
            ).first()
            
            if enrollment:
                completed = CompletedLesson.query.filter_by(
                    enrollment_id=enrollment.id
                ).all()
                completed_lesson_ids = {c.lesson_id for c in completed}
        
        lessons_list = [{
            'id': lesson.id,
            'week': lesson.week,
            'title': lesson.title,
            'content': lesson.content,
            'video_url': lesson.video_url,
            'duration': lesson.duration,
            'order': lesson.order,
            'completed': lesson.id in completed_lesson_ids
        } for lesson in lessons]
        
        return jsonify({'lessons': lessons_list}), 200
        
    except Exception as e:
        print(f"❌ Error fetching lessons: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/courses/<int:course_id>/progress', methods=['POST'])
def update_course_progress(course_id):
    """Update user's progress in a course"""
    try:
        data = request.json
        user_id = data.get('user_id')
        lesson_id = data.get('lesson_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Get enrollment
        enrollment = CourseEnrollment.query.filter_by(
            user_id=user_id,
            course_id=course_id
        ).first()
        
        if not enrollment:
            return jsonify({'error': 'Not enrolled in this course'}), 404
        
        # Mark lesson as completed if provided
        if lesson_id:
            # Check if already completed
            existing = CompletedLesson.query.filter_by(
                enrollment_id=enrollment.id,
                lesson_id=lesson_id
            ).first()
            
            if not existing:
                completed = CompletedLesson(
                    enrollment_id=enrollment.id,
                    lesson_id=lesson_id
                )
                db.session.add(completed)
                enrollment.completed_lessons += 1
        
        # Calculate progress
        course = Course.query.get(course_id)
        if course.total_lessons > 0:
            enrollment.progress = int((enrollment.completed_lessons / course.total_lessons) * 100)
        
        enrollment.last_accessed = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'progress': enrollment.progress,
            'completed_lessons': enrollment.completed_lessons
        }), 200
        
    except Exception as e:
        print(f"❌ Error updating progress: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# =========================================================================
# =========== SEED SAMPLE COURSES (Run once to populate database) =========
# =========================================================================

@app.route('/api/seed-courses', methods=['POST'])
def seed_courses():
    """Seed database with sample courses (for testing)"""
    try:
        # Check if courses already exist
        if Course.query.count() > 0:
            return jsonify({'message': 'Courses already exist'}), 200
        
        sample_courses = [
            {
                'title': 'Advanced Machine Learning',
                'subject': 'Computer Science',
                'category': 'computer-science',
                'description': 'Master advanced ML algorithms, neural networks, and deep learning techniques',
                'instructor': 'Dr. Sarah Chen',
                'thumbnail': '🤖',
                'color': 'from-blue-500 to-indigo-600',
                'total_lessons': 24,
                'duration': '12 weeks',
                'level': 'Advanced',
                'rating': 4.8,
                'students_count': 2547
            },
            {
                'title': 'Organic Chemistry Fundamentals',
                'subject': 'Chemistry',
                'category': 'science',
                'description': 'Comprehensive guide to organic chemistry reactions and mechanisms',
                'instructor': 'Prof. Michael Roberts',
                'thumbnail': '🧪',
                'color': 'from-green-500 to-emerald-600',
                'total_lessons': 18,
                'duration': '10 weeks',
                'level': 'Intermediate',
                'rating': 4.6,
                'students_count': 1823
            },
            {
                'title': 'World History: Renaissance Era',
                'subject': 'History',
                'category': 'history',
                'description': 'Explore the cultural and artistic revolution of the Renaissance period',
                'instructor': 'Dr. Emily Watson',
                'thumbnail': '📜',
                'color': 'from-purple-500 to-pink-600',
                'total_lessons': 15,
                'duration': '8 weeks',
                'level': 'Intermediate',
                'rating': 4.9,
                'students_count': 3421
            },
            {
                'title': 'Calculus II: Integration',
                'subject': 'Mathematics',
                'category': 'mathematics',
                'description': 'Advanced integration techniques and their applications',
                'instructor': 'Prof. David Kim',
                'thumbnail': '📐',
                'color': 'from-orange-500 to-red-600',
                'total_lessons': 20,
                'duration': '10 weeks',
                'level': 'Advanced',
                'rating': 4.7,
                'students_count': 1956
            },
            {
                'title': 'Data Structures & Algorithms',
                'subject': 'Computer Science',
                'category': 'computer-science',
                'description': 'Essential data structures and algorithmic thinking',
                'instructor': 'Dr. Alex Johnson',
                'thumbnail': '🗂️',
                'color': 'from-cyan-500 to-blue-600',
                'total_lessons': 28,
                'duration': '14 weeks',
                'level': 'Intermediate',
                'rating': 4.9,
                'students_count': 4532
            },
            {
                'title': 'Web Development Bootcamp',
                'subject': 'Computer Science',
                'category': 'computer-science',
                'description': 'Full-stack web development from HTML to deployment',
                'instructor': 'Jake Williams',
                'thumbnail': '🌐',
                'color': 'from-teal-500 to-green-600',
                'total_lessons': 45,
                'duration': '20 weeks',
                'level': 'Beginner',
                'rating': 4.9,
                'students_count': 6789
            }
        ]
        
        for course_data in sample_courses:
            course = Course(**course_data)
            db.session.add(course)
        
        db.session.commit()
        
        print("✅ Sample courses created successfully!")
        return jsonify({'message': f'{len(sample_courses)} courses created successfully'}), 201
        
    except Exception as e:
        print(f"❌ Error seeding courses: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

# =========================================================================
# =========== LEADERBOARD & STATS ROUTES ==================================
# =========================================================================

def get_filtered_leaderboard_query(time_filter='weekly', category='all'):
    """
    Returns a SQLAlchemy query for users ordered by points,
    with filters for time and category.
    """
    # Base query for users and their total points
    query = db.session.query(
        User,
        func.coalesce(func.sum(QuizAttempt.score), 0).label('total_score')
    ).outerjoin(QuizAttempt, User.id == QuizAttempt.user_id)

    # Time Filtering
    now = datetime.utcnow()
    if time_filter == 'daily':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(QuizAttempt.completed_at >= start_date)
    elif time_filter == 'weekly':
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(QuizAttempt.completed_at >= start_date)
    elif time_filter == 'monthly':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(QuizAttempt.completed_at >= start_date)
    # 'all-time' needs no time filter on attempts, but we still calculate total points

    # Category Filtering (Requires joining through Quiz and Document)
    if category != 'all':
        query = query.join(Quiz, QuizAttempt.quiz_id == Quiz.id)\
                     .join(Document, Quiz.document_id == Document.id)\
                     .filter(Document.category == category) # Assuming Document has a category field

    # Group by user and order by the calculated score
    query = query.group_by(User.id).order_by(db.desc('total_score'))
    
    return query


@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard_data():
    try:
        time_filter = request.args.get('time', 'weekly')
        category = request.args.get('category', 'all')
        
        # Get previous period's leaderboard to calculate rank changes
        # This is a simplified approach; a more robust solution would use snapshots.
        prev_leaderboard_query = get_filtered_leaderboard_query('all-time')
        prev_ranks = {user.id: rank for rank, (user, score) in enumerate(prev_leaderboard_query.all(), 1)}

        # Get current leaderboard
        leaderboard_query = get_filtered_leaderboard_query(time_filter, category)
        top_users = leaderboard_query.limit(50).all()
        
        leaderboard_list = []
        for i, (user, score) in enumerate(top_users, 1):
            prev_rank = prev_ranks.get(user.id)
            rank_change = (prev_rank - i) if prev_rank else 0
                
            leaderboard_list.append({
                'rank': i,
                'id': user.id,
                'name': user.name,
                'score': score,
                'streak': user.streak,
                'avatar': '🎯', # Placeholder
                'rankChange': rank_change,
            })
            
        return jsonify(leaderboard_list), 200
        
    except Exception as e:
        print(f"❌ Error fetching leaderboard: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/user/stats/<user_id>', methods=['GET'])
def get_user_stats(user_id):
    # ... (Your existing get_user_stats route is fine, but can be improved)
    # This is a more complete version:
    try:
        user = User.query.get(user_id)
        if not user: return jsonify({'error': 'User not found'}), 404
        
        # Calculate global rank
        rank_subquery = db.session.query(
            User.id,
            func.rank().over(order_by=User.points.desc()).label('rank')
        ).subquery()
        user_rank_result = db.session.query(rank_subquery.c.rank).filter(rank_subquery.c.id == user_id).first()
        user_rank = user_rank_result[0] if user_rank_result else -1
        
        total_users = User.query.count()

        # Weekly stats
        now = datetime.utcnow()
        start_of_week = now - timedelta(days=now.weekday())
        weekly_attempts = QuizAttempt.query.filter(
            QuizAttempt.user_id == user_id,
            QuizAttempt.completed_at >= start_of_week
        ).all()
        
        points_gained_week = sum(a.score * 10 for a in weekly_attempts) # Example points calc
        quizzes_won_week = sum(1 for a in weekly_attempts if (a.score / a.total_questions) >= 0.7)

        return jsonify({
            'rank': user_rank,
            'totalUsers': total_users,
            'quizzesWonWeek': quizzes_won_week,
            'pointsGainedWeek': points_gained_week,
            'streak': user.streak or 0,
            'levelProgress': (user.points % 1000) / 10 # Example: 1000 points per level
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching user stats: {e}")
        return jsonify({'error': str(e)}), 500

# =========================================================================
# =========== SOCKET.IO EVENTS FOR REAL-TIME LEADERBOARD =================
# =========================================================================

def broadcast_leaderboard_update(triggering_user_id=None, points_gained=0):
    """Helper function to broadcast leaderboard to all connected clients"""
    with app.app_context():
        # Fetch top 50 users for the broadcast (can be adjusted)
        query = get_filtered_leaderboard_query('weekly', 'all')
        top_users = query.limit(50).all()

        # To calculate rank changes, we get the "all-time" rank as a baseline
        prev_leaderboard_query = get_filtered_leaderboard_query('all-time')
        prev_ranks = {user.id: rank for rank, (user, score) in enumerate(prev_leaderboard_query.all(), 1)}

        leaderboard = []
        for i, (user, score) in enumerate(top_users, 1):
            prev_rank = prev_ranks.get(user.id)
            rank_change = (prev_rank - i) if prev_rank is not None else 0
            
            leaderboard.append({
                'rank': i,
                'id': user.id,
                'name': user.name,
                'score': score,
                'streak': user.streak or 0,
                'avatar': '🎯',
                'rankChange': rank_change,
            })
        
        last_activity_data = None
        if triggering_user_id:
            user = User.query.get(triggering_user_id)
            if user:
                last_activity_data = {
                    'userId': triggering_user_id,
                    'userName': user.name,
                    'pointsGained': points_gained,
                }
        
        payload = {
            'leaderboard': leaderboard,
            'lastActivity': last_activity_data
        }
        
        socketio.emit('leaderboard_update', payload)
        print(f"🚀 Broadcasted leaderboard update, triggered by {triggering_user_id}")

# Modify your `submit_full_quiz` route to call the broadcast
@app.route('/api/quiz/submit-full', methods=['POST'])
def submit_full_quiz():
    try:
        data = request.json
        user_id = data.get('user_id')
        final_score = data.get('score')
        # ... (rest of your logic) ...

        user = User.query.get(user_id)
        if not user: return jsonify({'error': 'User not found'}), 404
        
        points_awarded = final_score * 10 
        user.points += points_awarded
        
        # ... (update streak, save attempt, etc.) ...
        db.session.commit()
        
        # Broadcast the update
        broadcast_leaderboard_update(
            triggering_user_id=user_id, 
            points_gained=points_awarded
        )
        
        return jsonify({'message': 'Quiz submitted and leaderboard updated'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
=======
>>>>>>> firebender

if __name__ == '__main__':
    with app.app_context():
        migrate_database_schema
        db.create_all()
    socketio.run(app, debug=True, port=5000)