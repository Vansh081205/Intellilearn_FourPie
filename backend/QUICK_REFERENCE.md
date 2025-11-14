# Quick Reference: Modular App Structure

## 📁 Directory Tree
```
backend/
├── app_modules/
│   ├── models/
│   │   ├── user.py
│   │   ├── teacher.py
│   │   ├── course.py
│   │   ├── document.py
│   │   ├── quiz.py
│   │   └── chat.py
│   ├── routes/
│   │   ├── documents.py
│   │   ├── quiz.py
│   │   ├── chat.py
│   │   ├── knowledge_graph.py
│   │   └── other.py
│   ├── services/
│   │   ├── gemini_service.py
│   │   └── fallback_service.py
│   ├── sockets/
│   │   └── handlers.py
│   └── utils/
│       ├── helpers.py
│       ├── db_migration.py
│       └── graph_builder.py
├── app_new.py          # NEW: Refactored main app
├── app.py              # OLD: Original monolithic app
└── MODULAR_ARCHITECTURE.md
```

## 🚀 Quick Start

```bash
# Run the new modular app
cd backend
python app_new.py

# Access at http://localhost:5000
```

## 📋 Route Organization

| Endpoint | File | Class/Function |
|----------|------|---|
| `/api/upload` | `routes/documents.py` | `upload_document()` |
| `/api/documents/<user_id>` | `routes/documents.py` | `load_documents()` |
| `/api/generate-quiz` | `routes/quiz.py` | `create_quiz()` |
| `/api/submit-answer` | `routes/quiz.py` | `submit_answer()` |
| `/api/chat/ask` | `routes/chat.py` | `chat_ask_question()` |
| `/api/knowledge-graph/generate` | `routes/knowledge_graph.py` | `generate_knowledge_graph()` |

## 🔧 Using Services

### GeminiService
```python
from app_modules.services.gemini_service import GeminiService

# Get AI response
answer = GeminiService.get_response("What is photosynthesis?", context)

# Extract concepts
concepts = GeminiService.extract_concepts(text)

# Explain concept
explanation = GeminiService.explain_concept("Mitochondria", context)

# Test connection
result = GeminiService.test_connection()
```

### FallbackResponseService
```python
from app_modules.services.fallback_service import FallbackResponseService

# Get fallback response
answer = FallbackResponseService.get_response(question, context)
```

## 📦 Using Utilities

### Helpers
```python
from app_modules.utils.helpers import get_or_create_user, generate_unique_id

# Get or create user
user = get_or_create_user("clerk_user_id")

# Generate unique ID
student_id = generate_unique_id('S', 5)  # S12345
teacher_id = generate_unique_id('T', 5)  # T54321
```

### Graph Builder
```python
from app_modules.utils.graph_builder import build_graph_structure

# Build graph
graph = build_graph_structure(concepts, filename, generator_type)
```

## 🗄️ Models Quick Access

```python
from app_modules.models import (
    User, Teacher, Course, CourseEnrollment,
    Document, Quiz, QuizAttempt, ChatMessage, db
)

# Create and save
user = User(id="clerk_123", role="student", points=100)
db.session.add(user)
db.session.commit()

# Query
user = User.query.get("clerk_123")
docs = Document.query.filter_by(user_id="clerk_123").all()
```

## 🔌 Socket Events

```javascript
// Client code remains the same
socket.emit('create_game', {
    username: 'John',
    quiz_id: 'quiz123',
    user_id: 'user456'
});

socket.on('game_created', (data) => {
    console.log(data.room_code);
});
```

## 🧪 Testing Individual Modules

```bash
# Test imports
python -c "from app_modules.models import User; print('✅ Models OK')"
python -c "from app_modules.routes.documents import documents_bp; print('✅ Documents OK')"
python -c "from app_modules.services.gemini_service import GeminiService; print('✅ Services OK')"

# Run syntax check
python -m py_compile app_new.py
```

## ⚙️ Configuration

### Environment Variables (`.env`)
```
GEMINI_API_KEY=your_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### Database (in `app_new.py`)
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///intellilearn.db'
app.config['SECRET_KEY'] = 'your-secret-key'
```

## 📝 Adding New Features

### New Route Endpoint
```python
# routes/my_feature.py
from flask import Blueprint, request, jsonify

my_feature_bp = Blueprint('my_feature', __name__, url_prefix='/api')

@my_feature_bp.route('/my-endpoint', methods=['POST'])
def my_endpoint():
    data = request.json
    return jsonify({'status': 'success'})
```

Then register in `app_new.py`:
```python
from app_modules.routes.my_feature import my_feature_bp
app.register_blueprint(my_feature_bp)
```

### New Service
```python
# services/my_service.py
class MyService:
    @staticmethod
    def do_something(param):
        return "result"
```

Use it:
```python
from app_modules.services.my_service import MyService
result = MyService.do_something("value")
```

## 🐛 Debugging

### Check if module loads
```python
python -c "from app_modules.models import db; print('Database OK')"
```

### List all routes
```python
python -c "from app_new import app; print([rule for rule in app.url_map.iter_rules()])"
```

### Database inspection
```python
python
>>> from app_new import app, db
>>> with app.app_context():
>>>     from app_modules.models import User
>>>     users = User.query.all()
>>>     print(users)
```

## 📚 Documentation Files

- `MODULAR_ARCHITECTURE.md` - Detailed architecture overview
- `MIGRATION_GUIDE.md` - How to migrate from old to new
- `README.md` - Project overview (if exists)

## ✅ Checklist for Deployment

- [ ] Test `app_new.py` runs without errors
- [ ] Verify all routes work
- [ ] Check database migrations
- [ ] Test API endpoints with frontend
- [ ] Verify Socket.IO works
- [ ] Check Gemini API key is set
- [ ] Backup original `app.py`
- [ ] Rename `app_new.py` to `app.py` (if ready)
- [ ] Run in production environment
- [ ] Monitor logs for errors

---

**Last Updated:** November 13, 2025  
**Status:** ✅ Ready for Production
