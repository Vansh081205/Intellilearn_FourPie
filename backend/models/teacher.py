"""
Teacher Model - Extended profile for teachers
Links to User model via clerk_user_id
"""
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db


class Teacher(db.Model):
    """
    Teacher extended profile
    Stores additional teacher-specific information
    """
    __tablename__ = 'teachers'

    # Primary Key
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # Link to User model (Clerk ID)
    clerk_user_id = db.Column(db.String(100), unique=True, nullable=True)

    # Basic Information
    email = db.Column(db.String(120), unique=True, nullable=False)
    teacher_id = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)

    # Status
    is_verified = db.Column(db.Boolean, default=True, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Additional Profile Info
    bio = db.Column(db.Text, nullable=True)
    institution = db.Column(db.String(200), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    specialization = db.Column(db.String(200), nullable=True)

    # Metadata
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    # Statistics
    total_students = db.Column(db.Integer, default=0)
    total_courses = db.Column(db.Integer, default=0)
    total_quizzes = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<Teacher {self.name} ({self.teacher_id})>'

    def to_dict(self):
        """Convert teacher to dictionary"""
        return {
            'id': self.id,
            'clerk_user_id': self.clerk_user_id,
            'email': self.email,
            'teacher_id': self.teacher_id,
            'name': self.name,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'bio': self.bio,
            'institution': self.institution,
            'department': self.department,
            'specialization': self.specialization,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'total_students': self.total_students,
            'total_courses': self.total_courses,
            'total_quizzes': self.total_quizzes
        }

    def update_stats(self, students=0, courses=0, quizzes=0):
        """Update teacher statistics"""
        self.total_students += students
        self.total_courses += courses
        self.total_quizzes += quizzes
