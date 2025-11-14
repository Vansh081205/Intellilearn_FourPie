# Migration Guide: From Monolithic to Modular Architecture

## Overview
Your Flask backend has been successfully refactored from a monolithic 1000+ line `app.py` into a clean, modular structure using Flask Blueprints.

## What Changed

### Before (Monolithic)
```
app.py (1000+ lines)
├── All models defined here
├── All routes mixed together
├── All services inline
├── Socket handlers mixed in
└── Everything in one file
```

### After (Modular)
```
app_modules/
├── models/          (Database models)
├── routes/          (API endpoints as blueprints)
├── services/        (Business logic)
├── sockets/         (Real-time handlers)
└── utils/           (Helper functions)
```

## File Mapping

### Models
| Old Location | New Location |
|-------------|------------|
| User class in app.py | `app_modules/models/user.py` |
| Teacher class | `app_modules/models/teacher.py` |
| Course, CourseEnrollment | `app_modules/models/course.py` |
| Document class | `app_modules/models/document.py` |
| Quiz, QuizAttempt | `app_modules/models/quiz.py` |
| ChatMessage | `app_modules/models/chat.py` |

### Routes
| Routes | New File |
|--------|----------|
| `/api/upload`, `/api/documents/*` | `app_modules/routes/documents.py` |
| `/api/generate-quiz`, `/api/submit-answer`, `/api/dashboard` | `app_modules/routes/quiz.py` |
| `/api/chat/*` | `app_modules/routes/chat.py` |
| `/api/knowledge-graph/*` | `app_modules/routes/knowledge_graph.py` |
| `/api/user/*`, `/api/subscription/*`, `/api/*/generate-id`, `/api/scrape-url`, `/api/debug/*` | `app_modules/routes/other.py` |

### Services
| Old Function | New Location |
|-------------|------------|
| get_gemini_response() | `app_modules/services/gemini_service.py::GeminiService.get_response()` |
| get_fallback_response() | `app_modules/services/fallback_service.py::FallbackResponseService.get_response()` |
| extract_concepts_with_gemini() | `app_modules/services/gemini_service.py::GeminiService.extract_concepts()` |
| explain_concept() | `app_modules/services/gemini_service.py::GeminiService.explain_concept()` |

### Sockets
| Old Code | New Location |
|----------|------------|
| Socket event handlers | `app_modules/sockets/handlers.py::register_socket_handlers()` |
| rooms dict | `app_modules/sockets/handlers.py::rooms` |
| get_leaderboard() | `app_modules/sockets/handlers.py::get_leaderboard()` |

### Utils
| Function | New Location |
|----------|------------|
| get_or_create_user() | `app_modules/utils/helpers.py` |
| generate_unique_id() | `app_modules/utils/helpers.py` |
| migrate_database_schema() | `app_modules/utils/db_migration.py` |
| build_graph_structure() | `app_modules/utils/graph_builder.py` |

## How to Migrate

### Option 1: Use New App Immediately (Recommended)
```bash
# In your project root:
cd backend

# The new app is ready to use
python app_new.py

# When satisfied, replace the old one:
mv app.py app_backup.py
mv app_new.py app.py
```

### Option 2: Gradual Migration
Keep both files running in different environments:
- Development: Use `app_new.py` (new modular version)
- Production: Keep `app.py` (old version) until fully tested

### Option 3: Manual Migration
If you have custom modifications in `app.py`:
1. Identify which module your code belongs to (models, routes, services, etc.)
2. Add it to the appropriate file in `app_modules/`
3. Update imports in `app_new.py`
4. Test thoroughly

## Testing the Migration

### 1. Database
```bash
# Initialize database with new app
python app_new.py
# Should create intellilearn.db automatically
```

### 2. Test All Routes
```bash
# Test document upload
curl -X POST http://localhost:5000/api/upload \
  -F "user_id=test_user" \
  -F "file=@sample.pdf"

# Test quiz generation
curl -X POST http://localhost:5000/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{"doc_id":"doc123","user_id":"user123"}'

# Test chat
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user123","question":"What is photosynthesis?"}'
```

### 3. Test Socket.IO
Use your frontend or a WebSocket client to test multiplayer games.

## Key Differences for Frontend

**Good news:** The API endpoints remain EXACTLY THE SAME!

Your frontend code doesn't need any changes:
```javascript
// This still works the same way
fetch('/api/chat/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id, question })
})
```

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'app_modules'"
**Solution:** Ensure you're running from the backend directory:
```bash
cd backend
python app_new.py
```

### Issue: "Database table already exists"
**Solution:** The migration handles this automatically. If issues persist:
```bash
rm intellilearn.db
python app_new.py  # Recreate fresh database
```

### Issue: "Routes not working"
**Solution:** Check that blueprints are registered in `app_new.py`. All should be there:
```python
app.register_blueprint(documents_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(knowledge_graph_bp)
app.register_blueprint(other_bp)
```

### Issue: "Gemini API not responding"
**Solution:** Same as before - check `.env` file:
```
GEMINI_API_KEY=your_actual_key
```

## Benefits You Get

| Benefit | Impact |
|---------|--------|
| **Easier Debugging** | Find code in seconds, not minutes |
| **Safer Changes** | Modify one module without affecting others |
| **Better Testing** | Test individual components in isolation |
| **Faster Development** | Add features without touching existing code |
| **Team Collaboration** | Multiple devs can work on different modules |
| **Code Reuse** | Services used across multiple routes |
| **Scalability** | Easy to add new features and routes |

## Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# Restore original app.py
cp app_backup.py app.py
python app.py
```

### Both Apps Side-by-Side (for testing)
```bash
# Run old app on port 5000
python app.py

# In another terminal, run new app on port 5001
python -c "import app_new; app_new.socketio.run(app_new.app, port=5001)"
```

## Next Steps

1. ✅ Review the modular structure in `app_modules/`
2. ✅ Test `app_new.py` thoroughly
3. ✅ Update frontend API calls if needed (usually not needed)
4. ✅ Deploy when confident
5. ✅ Archive `app.py` as backup

## Support

For issues or questions:
1. Check `MODULAR_ARCHITECTURE.md` for structure details
2. Look at individual module files (well-commented)
3. Compare old `app.py` with new modular version
4. Test individual blueprints

---

**Status:** ✅ Migration Complete - New modular app ready to use!
