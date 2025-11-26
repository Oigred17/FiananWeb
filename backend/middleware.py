from functools import wraps
from flask import request, jsonify
import jwt
from config import Config
import time

def create_token(user_id, username):
    """Crea un token JWT para el usuario"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': int(time.time()) + (Config.JWT_EXPIRATION_HOURS * 3600)
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    return token

def decode_token(token):
    """Decodifica un token JWT"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorador para proteger rutas que requieren autenticación"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Obtener token del header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Formato de token inválido'}), 401
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401
        
        # Decodificar token
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        # Pasar información del usuario a la función
        return f(payload, *args, **kwargs)
    
    return decorated
