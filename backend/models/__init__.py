"""
Database models package
"""
from .user import User
from .teacher import Teacher
from .document import Document
from .quiz import Quiz, QuizAttempt
from .chat import ChatMessage

__all__ = [
    'User',
    'Teacher',
    'Document',
    'Quiz',
    'QuizAttempt',
    'ChatMessage'
]
