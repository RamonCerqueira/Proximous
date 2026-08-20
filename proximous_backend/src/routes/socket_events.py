from flask_socketio import emit, join_room, leave_room
from flask import request

def register_socket_events(socketio):
    """
    Registers WebSocket real-time events for chat rooms and typing indicators.
    """
    
    @socketio.on('connect')
    def handle_connect():
        print(f"Client connected via WebSocket: {request.sid}")
        emit('connection_response', {'status': 'connected', 'sid': request.sid})

    @socketio.on('disconnect')
    def handle_disconnect():
        print(f"Client disconnected: {request.sid}")

    @socketio.on('authenticate')
    def handle_authenticate(data):
        """Join a personal notification room keyed by user_id"""
        user_id = data.get('user_id')
        if user_id:
            join_room(f"user_{user_id}")
            print(f"User {user_id} joined personal notification room")
            emit('authenticated', {'status': 'ok', 'room': f"user_{user_id}"})

    @socketio.on('join_match_room')
    def handle_join_room(data):
        match_id = data.get('match_id')
        user_id = data.get('user_id')
        if match_id and user_id:
            # Verify user is part of this match before joining
            try:
                from src.models.user import Match
                from sqlalchemy import or_, and_
                match = Match.query.filter(
                    Match.id == match_id,
                    or_(
                        Match.user1_id == user_id,
                        Match.user2_id == user_id
                    ),
                    Match.is_active == True
                ).first()
                if match:
                    room = f"match_{match_id}"
                    join_room(room)
                    print(f"User {user_id} joined room {room}")
                    emit('room_joined', {'match_id': match_id, 'room': room})
                else:
                    emit('room_join_denied', {'reason': 'Not a participant of this match'})
            except Exception as e:
                print(f"Room join error: {e}")
                # Fallback: allow join if DB check fails
                room = f"match_{match_id}"
                join_room(room)
                emit('room_joined', {'match_id': match_id, 'room': room})

    @socketio.on('leave_match_room')
    def handle_leave_room(data):
        match_id = data.get('match_id')
        if match_id:
            room = f"match_{match_id}"
            leave_room(room)
            emit('room_left', {'match_id': match_id})

    @socketio.on('typing_indicator')
    def handle_typing_indicator(data):
        match_id = data.get('match_id')
        user_id = data.get('user_id')
        is_typing = data.get('is_typing', False)
        if match_id:
            room = f"match_{match_id}"
            emit('user_typing', {
                'match_id': match_id,
                'user_id': user_id,
                'is_typing': is_typing
            }, room=room, include_self=False)

    @socketio.on('send_live_message')
    def handle_live_message(data):
        match_id = data.get('match_id')
        if match_id:
            room = f"match_{match_id}"
            emit('new_message_received', data, room=room, include_self=False)
