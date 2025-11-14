"""
Authentication and Authorization Middleware
Provides decorators for protecting routes and checking user roles
"""
from functools import wraps
from flask import request, jsonify
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import User, Teacher
import jwt


def get_user_from_request():
    """
    Extract user_id from request headers or body
    Returns user object or None
    """
    # Try to get from Authorization header (if using JWT)
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            # Decode JWT token (if implemented)
            decoded = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
            user_id = decoded.get('user_id')
            if user_id:
                return User.query.get(user_id)
        except:
            pass

    # Try to get from request body
    if request.is_json:
        data = request.get_json()
        user_id = data.get('user_id')
        if user_id:
            return User.query.get(user_id)

    # Try to get from query params
    user_id = request.args.get('user_id')
    if user_id:
        return User.query.get(user_id)

    return None


def require_auth(f):
    """
    Decorator to require authentication
    Usage: @require_auth
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()
        if not user:
            return jsonify({
                'error': 'Authentication required',
                'message': 'Please log in to access this resource'
            }), 401

        # Pass user to the route function
        request.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def require_role(*allowed_roles):
    """
    Decorator to require specific role(s)
    Usage: @require_role('teacher') or @require_role('teacher', 'admin')
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_user_from_request()

            if not user:
                return jsonify({
                    'error': 'Authentication required',
                    'message': 'Please log in to access this resource'
                }), 401

            if user.role not in allowed_roles:
                return jsonify({
                    'error': 'Access denied',
                    'message': f'This resource requires {" or ".join(allowed_roles)} role',
                    'your_role': user.role
                }), 403

            # Pass user to the route function
            request.current_user = user
            return f(*args, **kwargs)

        return decorated_function

    return decorator


def require_teacher(f):
    """
    Decorator to require teacher role
    Also ensures teacher profile exists
    Usage: @require_teacher
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()

        if not user:
            return jsonify({
                'error': 'Authentication required',
                'message': 'Please log in as a teacher'
            }), 401

        if user.role != 'teacher':
            return jsonify({
                'error': 'Teacher access required',
                'message': 'This resource is only accessible to teachers',
                'your_role': user.role
            }), 403

        # Get teacher profile
        teacher = Teacher.query.filter_by(clerk_user_id=user.id).first()
        if not teacher:
            return jsonify({
                'error': 'Teacher profile not found',
                'message': 'Please complete teacher registration'
            }), 403

        # Pass user and teacher to the route function
        request.current_user = user
        request.current_teacher = teacher
        return f(*args, **kwargs)

    return decorated_function


def require_student(f):
    """
    Decorator to require student role
    Usage: @require_student
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()

        if not user:
            return jsonify({
                'error': 'Authentication required',
                'message': 'Please log in as a student'
            }), 401

        if user.role != 'student':
            return jsonify({
                'error': 'Student access required',
                'message': 'This resource is only accessible to students',
                'your_role': user.role
            }), 403

        # Pass user to the route function
        request.current_user = user
        return f(*args, **kwargs)

    return decorated_function


def optional_auth(f):
    """
    Decorator that allows optional authentication
    If user is authenticated, adds to request, otherwise continues
    Usage: @optional_auth
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_request()
        request.current_user = user  # Can be None
        return f(*args, **kwargs)

    return decorated_function


def get_teacher_from_user(user_id):
    """
    Helper function to get Teacher object from user_id
    Returns (teacher_object, teacher_id) or (None, None)
    """
    user = User.query.get(user_id)
    if not user or user.role != 'teacher':
        return None, None

    teacher = Teacher.query.filter_by(clerk_user_id=user_id).first()
    if not teacher:
        return None, None

    return teacher, teacher.id
