import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database and models
from app_modules.models import db
from app_modules.models import User, Teacher, Course, CourseEnrollment, Document, Quiz, QuizAttempt, ChatMessage
from app_modules.models import StudentAnalytics, QuizSession, RecommendedQuiz, StudentClassification, QuestionAttempt, \
    ConceptMastery

# Import blueprints
from app_modules.routes.documents import documents_bp
from app_modules.routes.quiz import quiz_bp
from app_modules.routes.chat import chat_bp
from app_modules.routes.knowledge_graph import knowledge_graph_bp
from app_modules.routes.other import other_bp
from app_modules.routes.analytics import analytics_bp

# Import socket handlers
from app_modules.sockets.handlers import register_socket_handlers

# =========================================================================
# =========== FLASK APP & DATABASE CONFIGURATION ==========================
# =========================================================================

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'intellilearn.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Register blueprints
app.register_blueprint(documents_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(knowledge_graph_bp)
app.register_blueprint(other_bp)
app.register_blueprint(analytics_bp)

# Register socket handlers
register_socket_handlers(socketio)

# =========================================================================
# =========== DATABASE INITIALIZATION =====================================
# =========================================================================

def migrate_database_schema():
    """Add missing columns to existing database - SQLite compatible"""
    from app_modules.utils.db_migration import migrate_database_schema as perform_migration
    perform_migration()

if __name__ == '__main__':
    with app.app_context():
        migrate_database_schema()
        db.create_all()
        print("✅ Database initialized successfully!")
    
    print("🚀 Starting IntelliLearn Flask Server...")
    socketio.run(app, debug=True, port=5000)
