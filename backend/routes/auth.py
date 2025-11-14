"""
Authentication routes - User authentication and role management
Handles Clerk webhooks and user role assignment
"""
from flask import Blueprint, request, jsonify
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions import db
from models import User, Teacher
import hmac
import hashlib

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


# Helper function
def get_or_create_user(user_id):
    """Get existing user or create new one with Clerk ID"""
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
        print(f"✅ Created new user: {user_id}")
    return user


def verify_clerk_webhook(request, clerk_webhook_secret):
    """Verify Clerk webhook signature"""
    if not clerk_webhook_secret:
        print("⚠️ Warning: CLERK_WEBHOOK_SECRET not set")
        return True  # Skip verification in development

    try:
        svix_id = request.headers.get('svix-id')
        svix_timestamp = request.headers.get('svix-timestamp')
        svix_signature = request.headers.get('svix-signature')

        if not all([svix_id, svix_timestamp, svix_signature]):
            return False

        payload = request.get_data(as_text=True)
        signed_content = f"{svix_id}.{svix_timestamp}.{payload}"

        expected_signature = hmac.new(
            clerk_webhook_secret.encode(),
            signed_content.encode(),
            hashlib.sha256
        ).hexdigest()

        signatures = svix_signature.split(',')
        for sig in signatures:
            if sig.startswith('v1='):
                provided_sig = sig[3:]
                if hmac.compare_digest(expected_signature, provided_sig):
                    return True

        return False
    except Exception as e:
        print(f"❌ Webhook verification error: {e}")
        return False


@auth_bp.route('/webhooks/clerk', methods=['POST'])
def clerk_webhook():
    """Handle Clerk user events (user.created, user.updated, user.deleted)"""
    try:
        from flask import current_app
        clerk_webhook_secret = current_app.config.get('CLERK_WEBHOOK_SECRET')

        # Verify webhook signature
        if not verify_clerk_webhook(request, clerk_webhook_secret):
            return jsonify({'error': 'Invalid signature'}), 401

        data = request.json
        event_type = data.get('type')
        user_data = data.get('data', {})

        print(f"📧 Clerk webhook received: {event_type}")

        if event_type == 'user.created':
            user_id = user_data.get('id')
            email_addresses = user_data.get('email_addresses', [])
            email = email_addresses[0].get('email_address') if email_addresses else None

            user = User.query.get(user_id)
            if not user:
                user = User(id=user_id, email=email)
                db.session.add(user)
                db.session.commit()
                print(f"✅ User created in DB: {user_id} ({email})")

        elif event_type == 'user.updated':
            user_id = user_data.get('id')
            email_addresses = user_data.get('email_addresses', [])
            email = email_addresses[0].get('email_address') if email_addresses else None

            user = get_or_create_user(user_id)
            if email and user.email != email:
                user.email = email
                db.session.commit()
            print(f"✅ User updated in DB: {user_id}")

        elif event_type == 'user.deleted':
            user_id = user_data.get('id')
            user = User.query.get(user_id)
            if user:
                db.session.delete(user)
                db.session.commit()
                print(f"✅ User deleted from DB: {user_id}")

        return jsonify({'success': True}), 200

    except Exception as e:
        print(f"❌ Webhook error: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/user/set-role', methods=['POST'])
def set_user_role():
    """Set user role (student/teacher) and create Teacher profile if needed"""
    try:
        data = request.json

        # Log the incoming request for debugging
        print(f"\n👤 Set Role Request:")
        print(f"   Raw data: {data}")

        user_id = data.get('user_id')
        role = data.get('role', 'student')
        teacher_id = data.get('teacher_id')
        email = data.get('email')
        name = data.get('name', None)

        print(f"   User ID: {user_id}")
        print(f"   Role: {role}")
        print(f"   Email: {email}")
        print(f"   Teacher ID: {teacher_id}")
        print(f"   Name: {name}")

        # Validate required fields
        if not user_id:
            print("   ❌ Missing user_id")
            return jsonify({
                'error': 'User ID is required',
                'details': 'The user_id field is missing from the request'
            }), 422

        if role not in ['student', 'teacher']:
            print(f"   ❌ Invalid role: {role}")
            return jsonify({
                'error': 'Invalid role. Must be student or teacher',
                'details': f'Received role: {role}'
            }), 422

        # Get or create user
        user = get_or_create_user(user_id)
        user.role = role

        # Set email if provided
        if email:
            user.email = email
            print(f"    ✉️ Email set: {email}")

        # If teacher, create Teacher profile
        if role == 'teacher':
            if not teacher_id:
                print("   ❌ Missing teacher_id for teacher role")
                return jsonify({
                    'error': 'Teacher ID is required for teacher role',
                    'details': 'Please provide teacher_id field'
                }), 422

            if not email:
                print("   ❌ Missing email for teacher role")
                return jsonify({
                    'error': 'Email is required for teacher role',
                    'details': 'Please provide email field'
                }), 422

            user.teacher_id = teacher_id
            print(f"    🆔 Teacher ID set: {teacher_id}")

            teacher_name = name if name else (email.split('@')[0] if email else "Teacher")

            existing_teacher = Teacher.query.filter(
                (Teacher.clerk_user_id == user_id) |
                (Teacher.teacher_id == teacher_id) |
                (Teacher.email == email)
            ).first()

            if not existing_teacher:
                new_teacher = Teacher(
                    clerk_user_id=user_id,
                    email=email,
                    teacher_id=teacher_id,
                    name=teacher_name,
                    is_verified=True
                )
                db.session.add(new_teacher)
                print(f"   ✅ Teacher profile created: {teacher_id} ({email}, {teacher_name})")
            else:
                existing_teacher.clerk_user_id = user_id
                existing_teacher.teacher_id = teacher_id
                existing_teacher.name = teacher_name
                print(f"   ℹ️  Existing Teacher profile updated: {teacher_id}")

        db.session.commit()

        print(f"   ✅ User role set successfully: {user_id} -> {role}")

        response_data = {
            'success': True,
            'user_id': user.id,
            'role': user.role,
            'teacher_id': user.teacher_id,
            'email': user.email
        }

        print(f"   📤 Response: {response_data}")

        return jsonify(response_data), 200

    except Exception as e:
        print(f"   ❌ Error setting user role: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@auth_bp.route('/user/profile/<user_id>', methods=['GET', 'OPTIONS'])
def get_user_profile(user_id):
    """Get user profile information"""
    try:
        print(f"\n📋 GET USER PROFILE REQUEST:")
        print(f"   User ID: {user_id}")
        print(f"   Method: {request.method}")

        # Handle OPTIONS request for CORS preflight
        if request.method == 'OPTIONS':
            from flask import make_response
            response = make_response()
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
            response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
            return response, 200

        # Get or create user
        user = User.query.get(user_id)
        if not user:
            print(f"   ⚠️ User not found, creating new user: {user_id}")
            user = User(id=user_id)
            db.session.add(user)
            db.session.commit()
            print(f"   ✅ User created: {user_id}")

        print(f"   📊 User data:")
        print(f"      Role: {user.role}")
        print(f"      Email: {user.email}")
        print(f"      Teacher ID: {user.teacher_id}")

        response_data = {
            'user_id': user.id,
            'email': user.email,
            'role': user.role,
            'teacher_id': user.teacher_id,
            'points': user.points,
            'subscription': user.subscription
        }

        # If teacher, add database teacher ID
        if user.role == 'teacher':
            teacher = Teacher.query.filter_by(clerk_user_id=user_id).first()
            if teacher:
                response_data['teacher_db_id'] = teacher.id
                response_data['teacher_name'] = teacher.name
                print(f"   👨‍🏫 Teacher found:")
                print(f"      DB ID: {teacher.id}")
                print(f"      Name: {teacher.name}")
            else:
                print(f"   ⚠️ User is teacher but Teacher profile not found")

        print(f"   ✅ Returning profile data")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"   ❌ Error getting user profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500
