📘 IntelliLearn — AI-Driven Adaptive Visual Learning & Gamified Quiz System

Personalized learning. Smart summaries. Gamified quizzes. Real analytics.

🚀 Overview

IntelliLearn is an AI-powered adaptive learning platform that automatically generates summaries, quizzes, concept maps, and personalized insights from any study material.
It transforms learning into a gamified, interactive, and data-driven experience for students, teachers, and institutions.

The system includes:

AI document understanding

Auto quiz generation

Gamified multiplayer quiz battles (Playground)

Adaptive learning analytics

Focus tracking

Teacher tools (courses, attendance, live sessions)

Knowledge graph visualization

AI Tutor & ELI5 explanations

⭐ Features
🎓 Student Features

Upload documents → AI generates:

Quick Notes

Detailed Notes

ELI5 explanations

Knowledge Graph

Auto-generated quizzes

Focus Mode (Normal + Parental Lock)

Gamified Playground quiz battles

Leaderboards (class, global, topic-wise)

Complete learning analytics:

Accuracy per topic

Time spent

Weak areas

Focus score

Speed & streak data

🧑‍🏫 Teacher Features

Create courses/modules

Upload material → AI summaries + quizzes

Assign quizzes/tests

Manage attendance

Track student performance & weaknesses

Host live classes (video/classroom mode)

Host playground tournaments

🤖 AI Features

AI Summaries (Quick/Deep/ELI5)

AI Quiz Generation (MCQ/TF/Fill)

AI Recommendations

Weak topic detection

Time-to-mastery prediction

Confusion cluster detection

Adaptive difficulty engine

⚙️ Tech Stack
Frontend

React.js

Tailwind CSS

Recharts / D3.js

Socket.IO Client

Backend

Flask (Python)

Flask-JWT-Extended

SQLAlchemy ORM

Flask-SocketIO (Realtime Playground)

Redis (pub/sub for multiplayer scale)

AI/NLP

OpenAI API / GPT

HuggingFace Transformers

T5 / Pegasus / BERT models

Scikit-learn / XGBoost

OCR (pdfplumber, Tesseract)

Database

SQLite (dev)

PostgreSQL (production)

🧱 Project Structure
intellilearn/
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   ├── services/
│   ├── ml/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md

🔧 Installation & Setup
Clone Repository
git clone https://github.com/yourusername/intellilearn.git
cd intellilearn

🖥️ Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

Environment Variables

Create .env file:

OPENAI_API_KEY=your_key_here
DATABASE_URL=sqlite:///intellilearn.db
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379

Run Backend
python app.py

🌐 Frontend Setup
cd frontend
npm install
npm start


React app runs at:
👉 http://localhost:3000

Backend runs at:
👉 http://localhost:5000

🕹️ Playground Realtime Quiz

Backend uses Flask-SocketIO for:

Live rooms

Player joins

Host controls

Speed scoring

Power-ups

Live leaderboard

Frontend uses socket.io-client.

📊 Analytics Engine

Tracks:

Accuracy per topic

Time spent per question

Streaks

Speed

Weak-topic detection

Focus mode metrics

Tab-switch events

Concept confusion clusters

ML Models included:

Weak topic classifier (XGBoost)

Drop-off predictor (Logistic Regression)

Time-to-mastery regression

🧪 ML Training

Training scripts in /backend/ml/:

train_weak_topic_model.py
train_dropout_model.py
feature_pipeline.py


Run:

python ml/train_weak_topic_model.py

📦 Docker Support
docker-compose up --build


This starts:

Frontend

Backend

Redis

Postgres

📸 Screenshots (Add yours here)
/screenshots/home.png  
/screenshots/library.png  
/screenshots/playground.png  
/screenshots/analysis.png  
/screenshots/teacher-dashboard.png  

🛡️ Security

JWT auth

Role-based access

Room authorization for Playground

Input sanitization

File size & type validation

🤝 Contributing

Fork the repo

Create a feature branch

Commit changes

Create a PR

📄 License

MIT License (change if needed)

⭐ Support

For help or collaboration
📧 Vansh081205@gmail.com

🐙 GitHub: Vansh081205
