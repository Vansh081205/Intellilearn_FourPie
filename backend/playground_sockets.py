"""
SocketIO routes - Real-time multiplayer game functionality
"""
from flask_socketio import emit, join_room, leave_room
from flask import request
from extensions import db
from models import User, Quiz
from services import GameService, QuizGameService
import json

# Initialize game services
casual_game_service = GameService()
quiz_game_service = QuizGameService()


def register_socketio_events(socketio):
    """Register all SocketIO event handlers"""

    @socketio.on('connect')
    def handle_connect():
        print(f'Client connected: {request.sid}')

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle player disconnection"""
        print(f'Client disconnected: {request.sid}')

        # Remove from both game services
        casual_game_service.remove_player(request.sid)
        quiz_game_service.remove_player(request.sid)

    # ===== CASUAL GAME EVENTS =====

    @socketio.on('create_room')
    def handle_create_room(data):
        """Create a casual game room"""
        username = data.get('username', 'Player')
        avatar = data.get('avatar', '🎯')

        room_code = casual_game_service.create_room(username, avatar, request.sid)
        join_room(room_code)

        emit('room_created', {'room_code': room_code})
        emit('update_room', casual_game_service.get_room(room_code), room=room_code)

        print(f'Room created: {room_code} by {username}')

    @socketio.on('join_room')
    def handle_join_room(data):
        """Join a casual game room"""
        room_code = data.get('room_code')
        username = data.get('username', 'Player')
        avatar = data.get('avatar', '🎯')

        result = casual_game_service.join_room(room_code, username, avatar, request.sid)

        if 'error' in result:
            emit('error', {'message': result['error']})
            return

        join_room(room_code)
        emit('player_joined', {'room_code': room_code, 'username': username}, room=room_code)
        emit('update_room', result['room'], room=room_code)

        print(f'{username} joined room {room_code}')

    @socketio.on('start_game')
    def handle_start_game(data):
        """Start a game"""
        room_code = data.get('room_code')

        # Check if it's a quiz game or casual game
        quiz_room = quiz_game_service.get_room(room_code)
        casual_room = casual_game_service.get_room(room_code)

        if quiz_room:
            result = quiz_game_service.start_game(room_code, request.sid)
            if 'error' in result:
                emit('error', {'message': result['error']})
                return

            emit('game_started', room=room_code)
            send_next_question(room_code)

        elif casual_room:
            result = casual_game_service.start_game(room_code, request.sid)
            if 'error' in result:
                emit('error', {'message': result['error']})
                return

            emit('game_started', {'room_code': room_code}, room=room_code)
            print(f'Game started in room {room_code}')

    @socketio.on('update_score')
    def handle_update_score(data):
        """Update player score in casual game"""
        room_code = data.get('room_code')
        username = data.get('username')
        delta = data.get('delta', 0)
        streak = data.get('streak', 0)

        result = casual_game_service.update_score(room_code, username, delta, streak)

        if result and 'room' in result:
            emit('update_room', result['room'], room=room_code)

    @socketio.on('player_answered')
    def handle_player_answered(data):
        """Broadcast that a player answered"""
        room_code = data.get('room_code')
        username = data.get('username')
        is_correct = data.get('isCorrect')

        emit('player_answered', {
            'username': username,
            'isCorrect': is_correct
        }, room=room_code, include_self=False)

    @socketio.on('next_question')
    def handle_next_question(data):
        """Move to next question in casual game"""
        room_code = data.get('room_code')
        question_index = data.get('questionIndex')

        room = casual_game_service.get_room(room_code)
        if room:
            room['currentQuestion'] = question_index
            emit('question_next', {'questionIndex': question_index}, room=room_code)

    @socketio.on('end_game')
    def handle_end_game(data):
        """End a game"""
        room_code = data.get('room_code')

        result = casual_game_service.end_game(room_code)
        if result and 'room' in result:
            emit('game_ended', {'room_code': room_code}, room=room_code)
            print(f'Game ended in room {room_code}')

    # ===== QUIZ GAME EVENTS =====

    @socketio.on('create_game')
    def handle_create_game(data):
        """Create a quiz-based game"""
        username = data.get('username')
        quiz_id = data.get('quiz_id')
        user_id = data.get('user_id')

        quiz = Quiz.query.get(quiz_id)
        if not (username and user_id and quiz):
            emit('error', {'message': 'Invalid data or quiz not found'})
            return

        # Ensure user exists
        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id)
            db.session.add(user)
            db.session.commit()

        questions = json.loads(quiz.questions_json)
        room_code = quiz_game_service.create_game(quiz_id, user_id, username, request.sid,
                                                  questions)

        join_room(room_code)
        emit('game_created', {'room_code': room_code, 'quiz_id': quiz.id})
        emit('lobby_update', {'players': quiz_game_service.get_leaderboard(room_code)})

    @socketio.on('join_game')
    def handle_join_game(data):
        """Join a quiz-based game"""
        username = data.get('username')
        room_code = data.get('room_code')
        user_id = data.get('user_id')

        result = quiz_game_service.join_game(room_code, user_id, username, request.sid)

        if 'error' in result:
            emit('error', {'message': result['error']})
            return

        # Ensure user exists
        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id)
            db.session.add(user)
            db.session.commit()

        join_room(room_code)
        emit('player_joined', {'username': username}, room=room_code)
        emit('lobby_update', {'players': quiz_game_service.get_leaderboard(room_code)},
             room=room_code)

    @socketio.on('player_answer')
    def handle_player_answer(data):
        """Handle player answer in quiz game"""
        room_code = data.get('room_code')
        answer = data.get('answer')

        result = quiz_game_service.submit_answer(room_code, request.sid, answer)

        if result and 'correct' in result:
            emit('leaderboard_update', {
                'leaderboard': quiz_game_service.get_leaderboard(room_code)
            }, room=room_code)

    def send_next_question(room_code):
        """Send the next question to all players"""
        result = quiz_game_service.get_next_question(room_code)

        if 'game_over' in result:
            # Save scores to database
            room = quiz_game_service.get_room(room_code)
            try:
                for player_data in room['players'].values():
                    user = User.query.get(player_data['user_id'])
                    if user:
                        user.points += player_data['score']
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Error saving scores: {e}")

            emit('game_over', {'leaderboard': quiz_game_service.get_leaderboard(room_code)},
                 room=room_code)
        else:
            emit('new_question', result, room=room_code)

    print("✅ SocketIO events registered")
