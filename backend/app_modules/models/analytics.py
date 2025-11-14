from . import db
from datetime import datetime


class StudentAnalytics(db.Model):
    """Detailed analytics for ML-based insights"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)

    # Performance metrics
    total_quizzes = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)

    # Difficulty tracking
    easy_attempts = db.Column(db.Integer, default=0)
    easy_correct = db.Column(db.Integer, default=0)
    medium_attempts = db.Column(db.Integer, default=0)
    medium_correct = db.Column(db.Integer, default=0)
    hard_attempts = db.Column(db.Integer, default=0)
    hard_correct = db.Column(db.Integer, default=0)

    # Topic performance (stored as JSON)
    topic_performance = db.Column(db.Text, default='{}')  # {topic: {correct, total}}

    # Study patterns
    avg_study_time = db.Column(db.Float, default=0.0)  # minutes per quiz
    study_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)

    # ML insights
    predicted_difficulty = db.Column(db.String(20), default='medium')
    learning_velocity = db.Column(db.Float, default=0.0)  # improvement rate
    mastery_score = db.Column(db.Float, default=0.0)  # 0-100

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())


class QuizSession(db.Model):
    """Tracks individual quiz sessions for detailed analysis"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quiz.id'), nullable=False)

    # Session details
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # seconds

    # Performance
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    difficulty = db.Column(db.String(20))

    # Detailed tracking
    question_timings = db.Column(db.Text)  # JSON: [{q_index, time_taken, correct}]
    powerups_used = db.Column(db.Text)  # JSON: [{type, question_index}]

    # Context
    is_multiplayer = db.Column(db.Boolean, default=False)
    room_code = db.Column(db.String(10))
    final_rank = db.Column(db.Integer)

    created_at = db.Column(db.DateTime, server_default=db.func.now())


class RecommendedQuiz(db.Model):
    """AI-recommended quizzes for students"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)

    # Recommendation details
    topic = db.Column(db.String(200))
    difficulty = db.Column(db.String(20))
    reason = db.Column(db.Text)  # Why this was recommended
    priority = db.Column(db.Integer, default=0)  # Higher = more important

    # Questions (generated on-demand or pre-generated)
    questions_json = db.Column(db.Text)  # Can be null if generated on-demand
    source_material = db.Column(db.Text)  # Related to weak areas

    # Status
    status = db.Column(db.String(20), default='pending')  # pending, completed, skipped
    completed_at = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    expires_at = db.Column(db.DateTime)  # Recommendations expire after some time


class StudentClassification(db.Model):
    """Educational data analyst classification of students"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False, unique=True)

    # Learning Capacity Classification
    capacity_category = db.Column(db.String(50))  # Fast Adapter, Steady Builder, Needs Scaffolding
    capacity_confidence = db.Column(db.Float, default=0.0)  # 0-1 confidence score
    capacity_evidence = db.Column(db.Text)  # JSON: supporting metrics

    # Progress Trajectory Classification
    trajectory_category = db.Column(db.String(50))  # Accelerating, Plateauing, Regressing
    trajectory_confidence = db.Column(db.Float, default=0.0)
    trajectory_trend_data = db.Column(db.Text)  # JSON: historical trend points

    # Error Pattern Classification
    primary_error_pattern = db.Column(db.String(50))  # Foundational Gap, Application Error, Precision/Attention
    error_confidence = db.Column(db.Float, default=0.0)
    error_examples = db.Column(db.Text)  # JSON: specific error instances

    # Intervention Strategy
    recommended_intervention = db.Column(db.Text)
    intervention_priority = db.Column(db.String(20))  # critical, high, medium, low

    # Metadata
    last_analysis = db.Column(db.DateTime, default=datetime.utcnow)
    analysis_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())


class QuestionAttempt(db.Model):
    """Detailed tracking of individual question attempts"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_session.id'), nullable=False)
    quiz_id = db.Column(db.String(36), db.ForeignKey('quiz.id'), nullable=False)

    # Question details
    question_index = db.Column(db.Integer)
    question_text = db.Column(db.Text)
    question_topic = db.Column(db.String(200))  # Extracted or tagged topic
    difficulty = db.Column(db.String(20))

    # Attempt details
    user_answer = db.Column(db.String(10))  # A, B, C, D
    correct_answer = db.Column(db.String(10))
    is_correct = db.Column(db.Boolean)

    # Timing analysis
    time_spent = db.Column(db.Integer)  # seconds
    attempts_on_question = db.Column(db.Integer, default=1)  # if allowed retries

    # Context
    powerup_used = db.Column(db.String(50))  # Which powerup if any
    confidence_level = db.Column(db.Integer)  # 1-5 if student self-reports

    # Error classification (auto-tagged)
    error_type = db.Column(db.String(50))  # foundational, application, precision
    prerequisite_topics = db.Column(db.Text)  # JSON: related topics needed

    created_at = db.Column(db.DateTime, server_default=db.func.now())


class ConceptMastery(db.Model):
    """Track mastery of specific concepts/topics over time"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), db.ForeignKey('user.id'), nullable=False)

    # Concept details
    concept_name = db.Column(db.String(200))
    concept_category = db.Column(db.String(100))  # Math, Science, History, etc.
    prerequisite_concepts = db.Column(db.Text)  # JSON: list of prerequisite concept_ids

    # Mastery metrics
    total_attempts = db.Column(db.Integer, default=0)
    correct_attempts = db.Column(db.Integer, default=0)
    mastery_level = db.Column(db.Float, default=0.0)  # 0-1 scale

    # Learning pattern
    avg_time_per_attempt = db.Column(db.Float, default=0.0)  # seconds
    improvement_rate = db.Column(db.Float, default=0.0)  # velocity
    last_attempt_date = db.Column(db.DateTime)

    # Status
    mastery_status = db.Column(db.String(50))  # novice, developing, proficient, mastered
    needs_review = db.Column(db.Boolean, default=False)
    review_priority = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
