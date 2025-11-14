import uuid
from . import db

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
