"""
Chat Model - Stores chat conversation history
"""
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db


class ChatMessage(db.Model):
    """Stores chat conversation history"""
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<ChatMessage {self.id} - User: {self.user_id}>'

    def to_dict(self):
        """Convert chat message to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question': self.question,
            'answer': self.answer,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
