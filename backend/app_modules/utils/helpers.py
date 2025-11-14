import random
import string
from app_modules.models import User, db

def get_or_create_user(user_id):
    """Get existing user or create new one with Clerk ID"""
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

def generate_unique_id(prefix='S', length=5):
    """Generate a unique ID with given prefix (S for Student, T for Teacher)"""
    while True:
        random_part = ''.join(random.choices(string.digits, k=length))
        unique_id = f"{prefix}{random_part}"
        return unique_id
