"""
Configuration settings for IntelliLearn backend
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')

    # Database
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'intellilearn.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS
    CORS_ORIGINS = "*"

    # SocketIO
    SOCKETIO_CORS_ALLOWED_ORIGINS = "*"
    SOCKETIO_ASYNC_MODE = 'threading'
    SOCKETIO_LOGGER = False
    SOCKETIO_ENGINEIO_LOGGER = False
    SOCKETIO_PING_TIMEOUT = 60
    SOCKETIO_PING_INTERVAL = 25

    # API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY')
    CLERK_WEBHOOK_SECRET = os.getenv('CLERK_WEBHOOK_SECRET')
    CLERK_PUBLISHABLE_KEY = os.getenv('CLERK_PUBLISHABLE_KEY')

    # API Configuration
    GEMINI_MODEL = 'gemini-2.5-flash'
    MAX_QUIZ_QUESTIONS = 5
    MAX_DOCUMENT_LENGTH = 10000

    # Rate Limiting
    RATE_LIMIT_ENABLED = True

    @staticmethod
    def init_app(app):
        """Initialize app with configuration"""
        pass


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

    @staticmethod
    def init_app(app):
        Config.init_app(app)
        # Add production-specific initialization


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
