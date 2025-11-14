import uuid
import json
from flask_socketio import emit, join_room, leave_room
from flask import request
from app_modules.models import db, Quiz, User

# In-memory storage for real-time game rooms
rooms = {}

def get_leaderboard(room_code):
    """Get sorted leaderboard for a room"""
    if room_code in rooms:
        players_list = []
        for sid, player in rooms[room_code]['players'].items():
            players_list.append({
                'sid': sid,
                'name': player.get('username', 'Player'),
                'username': player.get('username', 'Player'),
                'score': player.get('score', 0),
                'streak': player.get('streak', 0)
            })
        return sorted(players_list, key=lambda p: p['score'], reverse=True)
    return []

def get_or_create_user(user_id):
    """Get existing user or create new one"""
    user = User.query.get(user_id)
    if not user:
        user = User(id=user_id)
        db.session.add(user)
        db.session.commit()
    return user

def register_socket_handlers(socketio):
    """Register all socket event handlers"""

    @socketio.on('connect')
    def handle_connect():
        print(f'✅ Client connected: {request.sid}')

    @socketio.on('create_room')
    def handle_create_room(data):
        """Create a casual game room for playground"""
        username = data.get('username', 'Player')
        avatar = data.get('avatar', '🎯')
        player_sid = request.sid

        # Generate unique room code
        room_code = str(uuid.uuid4())[:6].upper()

        print(f'🎮 Creating room {room_code} for {username}')

        rooms[room_code] = {
            'host_sid': player_sid,
            'state': 'waiting',
            'current_question': 0,
            'players': {
                player_sid: {
                    'username': username,
                    'name': username,
                    'avatar': avatar,
                    'score': 0,
                    'streak': 0,
                    'sid': player_sid
                }
            }
        }

        join_room(room_code)
        emit('room_created', {'room_code': room_code})
        emit('update_room', {'players': get_leaderboard(room_code)}, room=room_code)

        print(f'✅ Room {room_code} created successfully')

    @socketio.on('join_room')
    def handle_join_room(data):
        """Join a casual game room"""
        room_code = data.get('room_code', '').upper()
        username = data.get('username', 'Player')
        avatar = data.get('avatar', '🎯')
        player_sid = request.sid

        print(f'👋 {username} attempting to join room {room_code}')

        if room_code not in rooms:
            print(f'❌ Room {room_code} not found')
            emit('error', {'message': 'Room not found'})
            return

        if rooms[room_code]['state'] != 'waiting':
            print(f'❌ Room {room_code} already started')
            emit('error', {'message': 'Game already started'})
            return

        join_room(room_code)
        rooms[room_code]['players'][player_sid] = {
            'username': username,
            'name': username,
            'avatar': avatar,
            'score': 0,
            'streak': 0,
            'sid': player_sid
        }

        emit('player_joined', {'room_code': room_code, 'username': username}, room=room_code)
        emit('update_room', {'players': get_leaderboard(room_code)}, room=room_code)

        print(f'✅ {username} joined room {room_code}. Total players: {len(rooms[room_code]["players"])}')

    @socketio.on('start_game')
    def handle_start_game(data):
        """Start a game"""
        room_code = data.get('room_code', '').upper()
        player_sid = request.sid

        print(f'🚀 Start game request for room {room_code}')

        if room_code not in rooms:
            emit('error', {'message': 'Room not found'})
            return

        if rooms[room_code]['host_sid'] != player_sid:
            emit('error', {'message': 'Not authorized'})
            return

        if len(rooms[room_code]['players']) < 2:
            emit('error', {'message': 'Need at least 2 players'})
            return

        rooms[room_code]['state'] = 'playing'
        emit('game_started', room=room_code)

        print(f'✅ Game started in room {room_code}')

    @socketio.on('update_score')
    def handle_update_score(data):
        """Update player score in casual game"""
        room_code = data.get('room_code', '').upper()
        username = data.get('username')
        delta = data.get('delta', 0)
        streak = data.get('streak', 0)
        is_correct = data.get('isCorrect', False)
        player_sid = request.sid

        if room_code not in rooms:
            return

        if player_sid in rooms[room_code]['players']:
            rooms[room_code]['players'][player_sid]['score'] += delta
            rooms[room_code]['players'][player_sid]['streak'] = streak

            print(
                f'📊 Score updated for {username} in room {room_code}: +{delta} (total: {rooms[room_code]["players"][player_sid]["score"]})')

            emit('update_room', {'players': get_leaderboard(room_code)}, room=room_code)

    @socketio.on('player_answered')
    def handle_player_answered(data):
        """Broadcast that a player answered"""
        room_code = data.get('room_code', '').upper()
        username = data.get('username')
        is_correct = data.get('isCorrect')

        if room_code in rooms:
            emit('player_answered', {
                'username': username,
                'isCorrect': is_correct
            }, room=room_code, include_self=False)

    @socketio.on('next_question')
    def handle_next_question(data):
        """Move to next question in casual game"""
        room_code = data.get('room_code', '').upper()
        question_index = data.get('questionIndex')

        if room_code in rooms:
            rooms[room_code]['current_question'] = question_index
            emit('question_next', {'questionIndex': question_index}, room=room_code)

    @socketio.on('end_game')
    def handle_end_game(data):
        """End a game"""
        room_code = data.get('room_code', '').upper()

        if room_code in rooms:
            rooms[room_code]['state'] = 'finished'
            emit('game_ended', {'room_code': room_code}, room=room_code)
            print(f'🏁 Game ended in room {room_code}')

    @socketio.on('create_game')
    def handle_create_game(data):
        """Create a quiz-based game"""
        username = data.get('username')
        quiz_id = data.get('quiz_id')
        user_id = data.get('user_id')
        player_sid = request.sid

        quiz = Quiz.query.get(quiz_id)
        if not (username and user_id and quiz):
            emit('error', {'message': 'Invalid data or quiz not found'})
            return

        room_code = str(uuid.uuid4())[:6].upper()
        get_or_create_user(user_id)

        rooms[room_code] = {
            'quiz_id': quiz.id,
            'questions': json.loads(quiz.questions_json),
            'host_sid': player_sid,
            'state': 'lobby',
            'current_question_index': -1,
            'players': {
                player_sid: {
                    'user_id': user_id,
                    'username': username,
                    'score': 0,
                    'streak': 0,
                    'sid': player_sid
                }
            }
        }

        join_room(room_code)
        emit('game_created', {'room_code': room_code, 'quiz_id': quiz.id})
        emit('lobby_update', {'players': get_leaderboard(room_code)})

    @socketio.on('join_game')
    def handle_join_game(data):
        """Join a quiz-based game"""
        username = data.get('username')
        room_code = data.get('room_code', '').upper()
        user_id = data.get('user_id')
        player_sid = request.sid

        if not (username and user_id and room_code and room_code in rooms):
            emit('error', {'message': 'Invalid data or room code'})
            return

        if rooms[room_code]['state'] != 'lobby':
            emit('error', {'message': 'Game already started'})
            return

        get_or_create_user(user_id)
        join_room(room_code)
        rooms[room_code]['players'][player_sid] = {
            'user_id': user_id,
            'username': username,
            'score': 0,
            'streak': 0,
            'sid': player_sid
        }

        emit('player_joined', {'username': username}, room=room_code)
        emit('lobby_update', {'players': get_leaderboard(room_code)}, room=room_code)

    @socketio.on('start_game')
    def handle_start_game(data):
        """Start a quiz-based game"""
        room_code = data.get('room_code')
        if room_code not in rooms or rooms[room_code]['host_sid'] != (request.sid if hasattr(request, 'sid') else None):
            emit('error', {'message': 'Not authorized'})
            return

        rooms[room_code]['state'] = 'playing'
        emit('game_started', room=room_code)
        send_next_question(socketio, room_code)

    @socketio.on('player_answer')
    def handle_player_answer(data):
        """Handle player answer in quiz game"""
        room_code = data.get('room_code', '').upper()
        answer = data.get('answer')
        player_sid = request.sid

        room = rooms.get(room_code)
        if not (room and room['state'] == 'playing' and player_sid in room['players']):
            return

        q_index = room['current_question_index']
        correct_answer = room['questions'][q_index]['correct']

        if answer == correct_answer:
            room['players'][player_sid]['score'] += 10
            room['players'][player_sid]['streak'] += 1
        else:
            room['players'][player_sid]['streak'] = 0

        emit('leaderboard_update', {'leaderboard': get_leaderboard(room_code)}, room=room_code)

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle player disconnection"""
        player_sid = request.sid
        print(f'🔌 Client disconnected: {player_sid}')

        for room_code, room_data in list(rooms.items()):
            if player_sid in room_data['players']:
                username = room_data['players'][player_sid].get('username', 'Player')
                del room_data['players'][player_sid]

                # If host left or no players remain, delete room
                if player_sid == room_data['host_sid'] or not room_data['players']:
                    print(f'🗑️ Deleting room {room_code} (host left or empty)')
                    del rooms[room_code]
                else:
                    print(f'👋 {username} left room {room_code}')
                    emit('update_room', {'players': get_leaderboard(room_code)}, room=room_code)
                break

def send_next_question(socketio, room_code):
    """Send the next question in the game"""
    room = rooms.get(room_code)
    if not room:
        return

    room['current_question_index'] += 1
    q_index = room['current_question_index']

    if q_index < len(room['questions']):
        current_q = room['questions'][q_index].copy()
        del current_q['correct']
        del current_q['explanation']
        socketio.emit('new_question', {
            'question': current_q,
            'question_number': q_index + 1,
            'total_questions': len(room['questions'])
        }, room=room_code)
    else:
        room['state'] = 'finished'
        try:
            for player_data in room['players'].values():
                user = User.query.get(player_data['user_id'])
                if user:
                    user.points += player_data['score']
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error saving scores: {e}")

        socketio.emit('game_over', {'leaderboard': get_leaderboard(room_code)}, room=room_code)