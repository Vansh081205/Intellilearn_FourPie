import uuid
from . import db

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
