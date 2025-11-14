@echo off
echo 🚀 Setting up IntelliLearn+ Hackathon Project...

REM Backend setup
echo 📦 Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo ✅ Backend dependencies installed

REM Frontend setup
echo 📦 Setting up frontend...
cd ..\frontend
call npm install
echo ✅ Frontend dependencies installed

echo.
echo 🎉 Setup complete!
echo.
echo To run the project:
echo 1. Backend: cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Don't forget to add your OpenAI API key to backend\.env!
pause