from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .teacher import Teacher
from .course import Course, CourseEnrollment
from .document import Document
from .quiz import Quiz, QuizAttempt
from .chat import ChatMessage
from .analytics import StudentAnalytics, QuizSession, RecommendedQuiz, StudentClassification, QuestionAttempt, \
    ConceptMastery

__all__ = ['db', 'User', 'Teacher', 'Course', 'CourseEnrollment', 'Document', 'Quiz', 'QuizAttempt', 'ChatMessage',
           'StudentAnalytics', 'QuizSession', 'RecommendedQuiz', 'StudentClassification', 'QuestionAttempt',
           'ConceptMastery']
