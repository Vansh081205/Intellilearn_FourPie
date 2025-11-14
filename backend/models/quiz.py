"""
Quiz Models - Stores quizzes and quiz attempts
"""
import uuid
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db


class Quiz(db.Model):
    """Stores generated quizzes"""
    __tablename__ = 'quizzes'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    difficulty = db.Column(db.String(20), nullable=False)
    questions_json = db.Column(db.Text, nullable=False)  # JSON string of questions
    document_id = db.Column(db.String(36), db.ForeignKey('documents.id'), nullable=False,
                            unique=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<Quiz {self.id} - {self.difficulty}>'

    def to_dict(self):
        """Convert quiz to dictionary"""
        return {
            'id': self.id,
            'difficulty': self.difficulty,
            'document_id': self.document_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class QuizAttempt(db.Model):
    """Tracks individual quiz attempts for adaptive learning"""
    __tablename__ = 'quiz_attempts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    difficulty = db.Column(db.String(20))
    completed_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<QuizAttempt {self.id} - User: {self.user_id}>'

    def to_dict(self):
        """Convert quiz attempt to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'score': self.score,
            'total_questions': self.total_questions,
            'difficulty': self.difficulty,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
