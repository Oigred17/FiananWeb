from flask import Blueprint, request, jsonify
import bcrypt
import time
from database import Database
from middleware import create_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registra un nuevo usuario"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['username', 'password', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        username = data['username']
        password = data['password']
        email = data['email']
        nombre_completo = data.get('nombre_completo', '')
        
        # Validar longitud de contraseña
        if len(password) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        
        # Hash de la contraseña
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insertar usuario en la base de datos
        with Database() as db:
            # Verificar si el usuario ya existe
            existing_user = db.execute_one(
                "SELECT id FROM usuarios WHERE username = %s OR email = %s",
                (username, email)
            )
            
            if existing_user:
                return jsonify({'error': 'El usuario o email ya existe'}), 409
            
            # Insertar nuevo usuario
            user_id = db.execute_insert(
                """
                INSERT INTO usuarios (username, password_hash, nombre_completo, email, fecha_registro)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (username, password_hash, nombre_completo, email, int(time.time()))
            )
            
            # Crear categorías por defecto para el nuevo usuario
            categorias_gastos = [
                ('Alimentación', 'Supermercado, restaurantes, comida'),
                ('Transporte', 'Gasolina, transporte público'),
                ('Vivienda', 'Renta, servicios, mantenimiento'),
                ('Entretenimiento', 'Cine, streaming, salidas'),
                ('Salud', 'Médico, farmacia, seguro'),
                ('Otros Gastos', 'Gastos varios')
            ]
            
            categorias_ingresos = [
                ('Salario', 'Sueldo mensual'),
                ('Freelance', 'Trabajos independientes'),
                ('Otros Ingresos', 'Ingresos varios')
            ]
            
            timestamp = int(time.time())
            
            for nombre, desc in categorias_gastos:
                db.execute(
                    """
                    INSERT INTO categorias (usuarioId, nombre, tipo, descripcion, fecha)
                    VALUES (%s, %s, 'gasto', %s, %s)
                    """,
                    (user_id, nombre, desc, timestamp)
                )
            
            for nombre, desc in categorias_ingresos:
                db.execute(
                    """
                    INSERT INTO categorias (usuarioId, nombre, tipo, descripcion, fecha)
                    VALUES (%s, %s, 'ingreso', %s, %s)
                    """,
                    (user_id, nombre, desc, timestamp)
                )
        
        # Crear token
        token = create_token(user_id, username)
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'token': token,
            'user': {
                'id': user_id,
                'username': username,
                'nombre_completo': nombre_completo,
                'email': email
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Inicia sesión de usuario"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Usuario y contraseña requeridos'}), 400
        
        username = data['username']
        password = data['password']
        
        # Buscar usuario en la base de datos
        with Database() as db:
            user = db.execute_one(
                """
                SELECT id, username, password_hash, nombre_completo, email
                FROM usuarios
                WHERE username = %s
                """,
                (username,)
            )
            
            if not user:
                return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401
            
            # Verificar contraseña
            if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401
        
        # Crear token
        token = create_token(user['id'], user['username'])
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'nombre_completo': user['nombre_completo'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Obtiene información del usuario actual (requiere token)"""
    from middleware import token_required
    
    @token_required
    def _get_user(current_user):
        try:
            with Database() as db:
                user = db.execute_one(
                    """
                    SELECT id, username, nombre_completo, email, fecha_registro
                    FROM usuarios
                    WHERE id = %s
                    """,
                    (current_user['user_id'],)
                )
                
                if not user:
                    return jsonify({'error': 'Usuario no encontrado'}), 404
                
                return jsonify({
                    'id': user['id'],
                    'username': user['username'],
                    'nombre_completo': user['nombre_completo'],
                    'email': user['email'],
                    'fecha_registro': user['fecha_registro']
                }), 200
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return _get_user()
