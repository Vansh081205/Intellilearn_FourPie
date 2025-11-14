# IntelliLearn Backend - Modular Architecture

This document explains the new modular structure of the IntelliLearn backend.

## Directory Structure

```
backend/
├── app_modules/                    # Main application modules
│   ├── __init__.py                # Package initialization
│   ├── models/                    # Database models
│   │   ├── __init__.py            # Model exports
│   │   ├── user.py                # User model
│   │   ├── teacher.py             # Teacher model
│   │   ├── course.py              # Course & CourseEnrollment models
│   │   ├── document.py            # Document model
│   │   ├── quiz.py                # Quiz & QuizAttempt models
│   │   └── chat.py                # ChatMessage model
│   │
│   ├── routes/                    # API route blueprints
│   │   ├── __init__.py            # Routes package
│   │   ├── documents.py           # Document upload, retrieval, deletion
│   │   ├── quiz.py                # Quiz generation, submission, dashboard
│   │   ├── chat.py                # Chat & message management
│   │   ├── knowledge_graph.py      # Knowledge graph generation & concept explanation
│   │   └── other.py               # Other routes (profiles, subscriptions, IDs)
│   │
│   ├── services/                  # Business logic services
│   │   ├── __init__.py            # Services package
│   │   ├── gemini_service.py       # Gemini AI integration
│   │   └── fallback_service.py     # Fallback responses when AI unavailable
│   │
│   ├── sockets/                   # Socket.IO handlers
│   │   ├── __init__.py            # Sockets package
│   │   └── handlers.py            # Multiplayer game handlers
│   │
│   └── utils/                     # Utility functions
│       ├── __init__.py            # Utils package
│       ├── helpers.py             # Common helpers (user creation, ID generation)
│       ├── db_migration.py         # Database schema migration
│       └── graph_builder.py        # Knowledge graph building utilities
│
├── app_new.py                     # Main Flask application (REFACTORED)
├── app.py                         # Original monolithic app (for reference)
├── requirements.txt               # Python dependencies
├── config.py                      # Configuration settings
├── extensions.py                  # Flask extensions
├── ai_engine.py                   # AI/ML logic (summary, quiz generation)
├── adaptive_logic.py              # Adaptive learning logic
├── migrate.py                     # Database migration script
└── ...
```

## Module Breakdown

### 1. **Models** (`app_modules/models/`)
Database models using SQLAlchemy:
- `user.py`: User authentication & profile data
- `teacher.py`: Teacher information
- `course.py`: Course management and student enrollments
- `document.py`: Uploaded study documents
- `quiz.py`: Generated quizzes and attempt tracking
- `chat.py`: Chat message history

### 2. **Routes** (`app_modules/routes/`)
Flask blueprints for API endpoints:
- `documents.py`: Upload, retrieve, delete documents
- `quiz.py`: Generate quizzes, submit answers, view dashboard
- `chat.py`: Ask questions, get chat history, manage messages
- `knowledge_graph.py`: Generate knowledge graphs, explain concepts
- `other.py`: User profiles, subscriptions, ID generation, URL scraping

### 3. **Services** (`app_modules/services/`)
Business logic and external API integration:
- `gemini_service.py`: Google Gemini AI responses, concept extraction
- `fallback_service.py`: Fallback responses for math calculations, general Q&A

### 4. **Sockets** (`app_modules/sockets/`)
Real-time multiplayer game logic:
- `handlers.py`: Game creation, joining, starting, answering, leaderboard updates

### 5. **Utils** (`app_modules/utils/`)
Helper utilities:
- `helpers.py`: User CRUD, ID generation
- `db_migration.py`: Database schema migration
- `graph_builder.py`: Knowledge graph node/link building

## How to Use

### Running the Modular App
```bash
# Use the new modular app.py
python app_new.py

# Or rename for production
cp app_new.py app.py
python app.py
```

### Key Improvements

✅ **Separation of Concerns**
- Models, routes, services, and utilities are isolated
- Each module has a single responsibility
- Easy to locate and modify specific features

✅ **Scalability**
- Add new routes by creating new blueprint files
- Add new services without touching existing code
- Easy to add new models and database tables

✅ **Maintainability**
- Clear file organization
- Reduced code duplication
- Easier to debug and test individual components

✅ **Reusability**
- Services can be used across multiple routes
- Utils can be imported and used anywhere
- Models are centrally managed

✅ **Testing**
- Can mock and test individual modules
- Each blueprint can be tested independently
- Services are easily testable

## Migration from Old to New

### Step 1: Backup Original
```bash
cp app.py app_backup.py
```

### Step 2: Switch to New App
```bash
cp app_new.py app.py
```

### Step 3: Test Routes
All endpoints should work exactly the same:
- `/api/upload` - Upload documents
- `/api/documents/<user_id>` - Get user documents
- `/api/generate-quiz` - Generate quiz
- `/api/chat/ask` - Ask questions
- `/api/knowledge-graph/generate` - Generate graphs
- etc.

## Adding New Features

### Example: Adding a New Route

1. Create new blueprint file in `routes/`
```python
# routes/new_feature.py
from flask import Blueprint

new_feature_bp = Blueprint('new_feature', __name__, url_prefix='/api')

@new_feature_bp.route('/new-endpoint', methods=['POST'])
def new_endpoint():
    # Your code here
    pass
```

2. Register in `app_new.py`
```python
from app_modules.routes.new_feature import new_feature_bp
app.register_blueprint(new_feature_bp)
```

### Example: Adding a New Service

1. Create service file in `services/`
```python
# services/new_service.py
class NewService:
    @staticmethod
    def do_something():
        # Your logic here
        pass
```

2. Import and use in routes
```python
from app_modules.services.new_service import NewService
result = NewService.do_something()
```

## Configuration

Database configuration in `app_new.py`:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intellilearn.db'
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
```

API keys via environment variables in `.env`:
```
GEMINI_API_KEY=your_key_here
```

## Troubleshooting

**Import Errors?**
- Ensure `app_modules/` directory is in Python path
- Check all `__init__.py` files exist
- Verify imports use `app_modules.` prefix

**Models Not Found?**
- Run `python app_new.py` to initialize database
- Check `intellilearn.db` is created
- Verify migrations with `python migrate.py`

**Blueprints Not Working?**
- Confirm blueprint is registered in `app_new.py`
- Check URL prefix and route decorators
- Verify blueprint names are unique

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| File Size | 1000+ lines | 50-200 lines each |
| Dependencies | All mixed | Isolated by concern |
| Testing | Difficult | Easy per module |
| Adding Features | Risky | Safe/isolated |
| Debugging | Time-consuming | Targeted |
| Reusability | Low | High |
| Documentation | Unclear structure | Clear organization |

---

**Note:** The original `app.py` is kept for reference. The new modular structure is in `app_new.py` and `app_modules/`. When ready for production, rename `app_new.py` to `app.py` and delete the old file.
