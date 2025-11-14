"""
User Model - Stores user account information
Linked to Clerk authentication system
"""
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db


class User(db.Model):
    """
    User model for students and teachers
    Primary authentication through Clerk, extended data stored here
    """
    __tablename__ = 'users'

    # Primary Key - Clerk User ID
    id = db.Column(db.String(100), primary_key=True)

    # Basic Information
    email = db.Column(db.String(255), unique=True, nullable=True, index=True)
    role = db.Column(db.String(20), default='student', nullable=False,
                     index=True)  # 'student' or 'teacher'

    # Teacher-specific field
    teacher_id = db.Column(db.String(20), unique=True, nullable=True, index=True)

    # Gamification & Subscription
    points = db.Column(db.Integer, default=100, nullable=False)
    subscription = db.Column(db.String(50), default='free',
                             nullable=False)  # 'free', 'basic', 'pro'
    redeemed_codes = db.Column(db.Text, default='[]',
                               nullable=False)  # JSON array of redeemed codes

    # Metadata
    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationships
    documents = db.relationship('Document', backref='author', lazy=True,
                                cascade='all, delete-orphan')
    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy=True,
                                    cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True,
                                    cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'teacher_id': self.teacher_id,
            'points': self.points,
            'subscription': self.subscription,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }

    def is_teacher(self):
        """Check if user is a teacher"""
        return self.role == 'teacher'

    def is_student(self):
        """Check if user is a student"""
        return self.role == 'student'

    def add_points(self, points):
        """Add points to user account"""
        self.points += points
        return self.points

    def deduct_points(self, points):
        """Deduct points from user account"""
        if self.points >= points:
            self.points -= points
            return True
        return False

    def upgrade_subscription(self, plan):
        """Upgrade user subscription"""
        valid_plans = ['free', 'basic', 'pro']
        if plan in valid_plans:
            self.subscription = plan
            return True
        return False
