from flask import Blueprint, request, jsonify, send_from_directory
import io
import PyPDF2
import os # NEW: for file path operations
from app_modules.models import db, Document, User
# Assuming ai_engine is available for generate_summary
from ai_engine import generate_summary 

documents_bp = Blueprint('documents', __name__, url_prefix='/api')

# --- CONFIGURATION: Define the directory for file storage ---
# Ensure this directory exists and Flask has write permissions. 
# It's best practice to put this outside the app module, but here for completeness.
UPLOAD_FOLDER = 'user_documents'

def get_or_create_user(user_id):
    """Get existing user or create new one with Clerk ID"""
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

# --- Consolidated Upload Route (Updated) ---
@documents_bp.route('/upload', methods=['POST'])
def upload_document():
    """Handles file upload, text extraction, summary generation, and secure file saving."""
    try:
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'error': 'User authentication required'}), 401
        
        user = get_or_create_user(user_id)

        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400

        file = request.files['file']
        filename = file.filename

        if filename == '':
            return jsonify({'error': 'No selected file'}), 400

        difficulty = request.form.get('difficulty', 'medium')
        
        # 1. Define the user-specific storage path and ensure it exists
        user_dir = os.path.join(UPLOAD_FOLDER, user_id)
        os.makedirs(user_dir, exist_ok=True) # Creates directory if it doesn't exist

        # 2. Generate a secure, unique filename for storage (using the database ID is common, 
        # but since we don't have the ID yet, we'll save it with the original name for now 
        # and rely on the user_dir for isolation).
        file_path = os.path.join(user_dir, filename)

        # Read the file content into memory for text extraction
        file_data = file.read() 
        
        # 3. Save the file to the user's private folder
        with open(file_path, 'wb') as f:
            f.write(file_data)

        # 4. Extract text content (using the in-memory data)
        if filename.lower().endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_data))
            text = "".join(page.extract_text() for page in pdf_reader.pages[:10] if page.extract_text())
        else:
            text = file_data.decode('utf-8')
        
        if not text:
            # Clean up the uploaded file if extraction fails
            os.remove(file_path) 
            return jsonify({'error': 'Could not extract text from the file.'}), 422


        # 5. Generate summary
        summary = generate_summary(text, difficulty)

        # 6. Save document metadata to database
        new_doc = Document(
            filename=filename,
            # NOTE: Storing text_content might be redundant if the file is stored, 
            # but keeping it for now as per original code.
            text_content=text, 
            summary=summary,
            difficulty=difficulty,
            user_id=user.id 
        )
        db.session.add(new_doc)
        db.session.commit()

        return jsonify({
            'message': 'Document uploaded and processed successfully',
            'doc_id': new_doc.id,
            'summary': summary,
            'filename': filename,
        }), 201
        
    except Exception as e:
        db.session.rollback()
        # Log the detailed error
        print(f"Error uploading document: {e}") 
        return jsonify({'error': f'Failed to process document: {str(e)}'}), 500

# -------------------------------------------------------------
# --- NEW Route for Secure File Access ---
# -------------------------------------------------------------
@documents_bp.route('/documents/file/<doc_id>', methods=['GET'])
def serve_document(doc_id):
    """
    Securely serves the original document file (PDF, etc.) to the owning user.
    
    Requires the user_id (Clerk ID) to be passed, typically via query param or headers, 
    and ensures the user owns the document before serving.
    """
    # NOTE: Assuming user_id is passed as a query parameter or from a token/header.
    # For simplicity, I'll use a query parameter. In production, use JWT or session data.
    auth_user_id = request.args.get('user_id') 

    if not auth_user_id:
        return jsonify({'error': 'User authentication required'}), 401

    document = Document.query.get(doc_id)

    if not document:
        return jsonify({'message': 'Document not found'}), 404

    # --- Authorization Check ---
    if document.user_id != auth_user_id:
        return jsonify({'error': 'Unauthorized access to this document'}), 403

    try:
        user_dir = os.path.join(UPLOAD_FOLDER, document.user_id)
        filename = document.filename
        
        # Use send_from_directory for security. It prevents path traversal attacks.
        return send_from_directory(
            directory=user_dir,
            path=filename,
            as_attachment=True, # Forces browser to download instead of display
            download_name=filename # Sets the name for the downloaded file
        )
    except FileNotFoundError:
        return jsonify({'error': 'File not found on server'}), 500
    except Exception as e:
        print(f"Error serving document: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# -------------------------------------------------------------
# --- Remaining Routes (Unchanged) ---
# -------------------------------------------------------------

@documents_bp.route('/documents/<user_id>', methods=['GET'])
def load_documents(user_id):
    """
    Fetches all documents for a user with calculated quiz statistics.
    """
    try:
        from sqlalchemy import func
        from app_modules.models import Quiz, QuizAttempt # Ensure these models are accessible

        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Note: func.sum(0) is a temporary fix for the schema mismatch until the DB is reset.
        quiz_stats = db.session.query(
            Quiz.document_id.label('doc_id'),
            func.count(QuizAttempt.id).label('quizzes_taken'),
            func.avg(QuizAttempt.score).label('average_score'),
            func.sum(0).label('total_study_time') 
        ).join(QuizAttempt, QuizAttempt.quiz_id == Quiz.id).group_by(Quiz.document_id).subquery()

        documents_with_stats = db.session.query(
            Document,
            quiz_stats.c.quizzes_taken,
            quiz_stats.c.average_score,
            quiz_stats.c.total_study_time
        ).filter(Document.user_id == user_id).outerjoin(
            quiz_stats, Document.id == quiz_stats.c.doc_id
        ).all()

        if not documents_with_stats:
            return jsonify({'documents': []}), 200 

        documents_list = []
        for doc, taken, avg, study_time in documents_with_stats: 
            documents_list.append({
                'doc_id': doc.id,
                'filename': doc.filename,
                'summary': doc.summary,
                'difficulty': doc.difficulty,
                'user_id': doc.user_id,
                'uploaded_at': doc.created_at.isoformat(),
                'quizzes_taken': int(taken) if taken else 0,
                'average_score': float(f'{avg:.2f}') if avg else 0.0,
                'total_study_time': float(f'{study_time:.2f}') if study_time else 0.0, 
            })

        return jsonify({'documents': documents_list}), 200

    except Exception as e:
        print(f"Error loading documents: {e}")
        return jsonify({'error': 'Internal server error during document fetch (check DB schema for QuizAttempt.study_time)'}), 500

@documents_bp.route('/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Deletes a specific document by its ID and its corresponding file."""
    try:
        document = Document.query.get(doc_id)

        if not document:
            return jsonify({'message': 'Document not found'}), 404

        # --- File Deletion ---
        file_path = os.path.join(UPLOAD_FOLDER, document.user_id, document.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # --- Database Deletion ---
        db.session.delete(document)
        db.session.commit()

        return jsonify({'message': 'Document and associated file deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting document: {e}")
        return jsonify({'error': 'Failed to delete document'}), 500