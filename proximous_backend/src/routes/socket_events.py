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

    @socketio.on('join_match_room')
    def handle_join_room(data):
        match_id = data.get('match_id')
        user_id = data.get('user_id')
        if match_id:
            room = f"match_{match_id}"
            join_room(room)
            print(f"User {user_id} joined room {room}")
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
