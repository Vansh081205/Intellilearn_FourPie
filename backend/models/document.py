"""
Document Model - Stores uploaded documents
"""
import uuid
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db


class Document(db.Model):
    """Stores uploaded documents"""
    __tablename__ = 'documents'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = db.Column(db.String(255), nullable=False)
    text_content = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationship to Quiz
    quiz = db.relationship('Quiz', backref='document', uselist=False, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Document {self.filename}>'

    def to_dict(self):
        """Convert document to dictionary"""
        return {
            'id': self.id,
            'filename': self.filename,
            'summary': self.summary,
            'difficulty': self.difficulty,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
