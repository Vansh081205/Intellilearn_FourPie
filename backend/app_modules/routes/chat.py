from flask import Blueprint, request, jsonify
from app_modules.models import db, ChatMessage, User
from app_modules.services.gemini_service import GeminiService
from app_modules.services.fallback_service import FallbackResponseService

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

def get_or_create_user(user_id):
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

@chat_bp.route('/ask', methods=['POST'])
def chat_ask_question():
    """Universal AI study assistant - WITH MESSAGE SAVING"""
    try:
        data = request.json
        user_id = data.get('user_id')
        question = data.get('question', '').strip()
        doc_id = data.get('doc_id')

        if not user_id or not question:
            return jsonify({'error': 'Missing required fields'}), 400

        print(f"\n💬 Question: {question}")

        user = get_or_create_user(user_id)

        # Get document context if available
        document_context = ""
        if doc_id:
            try:
                from app_modules.models import Document
                doc = Document.query.get(doc_id)
                if doc:
                    document_context = doc.text_content[:2000]
            except Exception as e:
                print(f"⚠️ Document error: {e}")

        # Try Gemini AI
        answer = GeminiService.get_response(question, document_context)
        if answer:
            print("✅ Gemini response")
        else:
            answer = FallbackResponseService.get_response(question, document_context)
            print("📝 Fallback response")

        # Save message to database
        try:
            chat_message = ChatMessage(
                user_id=user_id,
                question=question,
                answer=answer
            )
            db.session.add(chat_message)
            db.session.commit()
            print("💾 Message saved to database")
        except Exception as e:
            print(f"⚠️ Failed to save message: {e}")
            db.session.rollback()

        return jsonify({
            'answer': answer,
            'question': question,
            'timestamp': chat_message.timestamp.isoformat() if chat_message else None
        })

    except Exception as e:
        print(f"💥 Fatal error: {e}")
        db.session.rollback()
        return jsonify({'answer': 'I encountered an error. Please try again!'}), 200

@chat_bp.route('/history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Get all chat messages for a user"""
    try:
        limit = request.args.get('limit', 50, type=int)

        messages = ChatMessage.query\
            .filter_by(user_id=user_id)\
            .order_by(ChatMessage.timestamp.desc())\
            .limit(limit)\
            .all()

        chat_history = [{
            'id': msg.id,
            'question': msg.question,
            'answer': msg.answer,
            'timestamp': msg.timestamp.isoformat(),
            'type': 'history'
        } for msg in reversed(messages)]

        print(f"📚 Loaded {len(chat_history)} messages for user {user_id}")

        return jsonify({
            'messages': chat_history,
            'count': len(chat_history)
        })

    except Exception as e:
        print(f"❌ Error loading chat history: {e}")
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/clear/<user_id>', methods=['DELETE'])
def clear_chat_history(user_id):
    """Clear all chat history for a user"""
    try:
        deleted = ChatMessage.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        print(f"🗑️ Cleared {deleted} messages for user {user_id}")

        return jsonify({
            'success': True,
            'deleted_count': deleted,
            'message': f'Cleared {deleted} messages'
        })

    except Exception as e:
        print(f"❌ Error clearing chat history: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/delete/<int:message_id>', methods=['DELETE'])
def delete_single_message(message_id):
    """Delete a single message"""
    try:
        message = ChatMessage.query.get(message_id)
        if not message:
            return jsonify({'error': 'Message not found'}), 404

        db.session.delete(message)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Message deleted'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
