from . import db

class Teacher(db.Model):
    """Stores teacher information"""
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    courses = db.relationship('Course', backref='instructor', lazy=True)
