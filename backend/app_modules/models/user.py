from . import db

class User(db.Model):
    """
    Stores Clerk user_id and app-specific data (points, subscription).
    Clerk handles authentication, we just reference their ID.
    """
    id = db.Column(db.String(100), primary_key=True)  # Clerk User ID
    role = db.Column(db.String(20), default='student')  # 'student' or 'teacher'
    teacher_id = db.Column(db.String(50), unique=True, nullable=True)
    points = db.Column(db.Integer, default=100)
    subscription = db.Column(db.String(50), default='free')
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    documents = db.relationship('Document', backref='author', lazy=True, cascade="all, delete-orphan")
    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy=True, cascade="all, delete-orphan")
    enrollments = db.relationship('CourseEnrollment', backref='student', lazy=True)
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True)
