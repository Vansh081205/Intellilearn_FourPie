"""
Flask extensions initialization
Separated to avoid circular imports
"""
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS

# Initialize extensions without app binding
db = SQLAlchemy()
socketio = SocketIO()
cors = CORS()


def init_extensions(app):
    """Initialize all Flask extensions with the app"""
    # Database
    db.init_app(app)

    # CORS
    cors.init_app(app, resources={r"/*": {"origins": app.config.get('CORS_ORIGINS', '*')}})

    # SocketIO
    socketio.init_app(
        app,
        cors_allowed_origins=app.config.get('SOCKETIO_CORS_ALLOWED_ORIGINS', '*'),
        async_mode=app.config.get('SOCKETIO_ASYNC_MODE', 'threading'),
        logger=app.config.get('SOCKETIO_LOGGER', False),
        engineio_logger=app.config.get('SOCKETIO_ENGINEIO_LOGGER', False),
        ping_timeout=app.config.get('SOCKETIO_PING_TIMEOUT', 60),
        ping_interval=app.config.get('SOCKETIO_PING_INTERVAL', 25)
    )

    print("✅ Extensions initialized")
