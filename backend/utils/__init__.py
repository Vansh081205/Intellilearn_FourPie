"""
Utilities package
"""
from .auth_middleware import (
    require_auth,
    require_role,
    require_teacher,
    require_student,
    optional_auth,
    get_user_from_request,
    get_teacher_from_user
)

__all__ = [
    'require_auth',
    'require_role',
    'require_teacher',
    'require_student',
    'optional_auth',
    'get_user_from_request',
    'get_teacher_from_user'
]
