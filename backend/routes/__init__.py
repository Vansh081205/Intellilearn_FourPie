"""
Routes package - API endpoints organized as blueprints
"""


def register_blueprints(app):
    """Register all blueprints with the Flask app"""

    # Import blueprints
    from .auth import auth_bp

    # Register blueprints
    app.register_blueprint(auth_bp)

    print("✅ All blueprints registered")


__all__ = ['register_blueprints']
