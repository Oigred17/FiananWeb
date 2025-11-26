from flask import Blueprint, request, jsonify
from database import Database
from middleware import token_required
import time

categorias_bp = Blueprint('categorias', __name__)

@categorias_bp.route('', methods=['GET'])
@token_required
def get_categorias(current_user):
    """Obtiene todas las categorías del usuario"""
    try:
        tipo = request.args.get('tipo')  # 'gasto' o 'ingreso'
        
        with Database() as db:
            if tipo:
                categorias = db.execute(
                    """
                    SELECT id, nombre, tipo, descripcion, fecha
                    FROM categorias
                    WHERE usuarioId = %s AND tipo = %s
                    ORDER BY nombre
                    """,
                    (current_user['user_id'], tipo)
                )
            else:
                categorias = db.execute(
                    """
                    SELECT id, nombre, tipo, descripcion, fecha
                    FROM categorias
                    WHERE usuarioId = %s
                    ORDER BY tipo, nombre
                    """,
                    (current_user['user_id'],)
                )
            
            return jsonify([dict(cat) for cat in categorias]), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@categorias_bp.route('', methods=['POST'])
@token_required
def create_categoria(current_user):
    """Crea una nueva categoría"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if 'nombre' not in data or 'tipo' not in data:
            return jsonify({'error': 'Nombre y tipo son requeridos'}), 400
        
        nombre = data['nombre']
        tipo = data['tipo']
        descripcion = data.get('descripcion', '')
        
        # Validar tipo
        if tipo not in ['gasto', 'ingreso']:
            return jsonify({'error': 'Tipo debe ser "gasto" o "ingreso"'}), 400
        
        with Database() as db:
            # Verificar si ya existe una categoría con ese nombre para el usuario
            existing = db.execute_one(
                "SELECT id FROM categorias WHERE usuarioId = %s AND nombre = %s",
                (current_user['user_id'], nombre)
            )
            
            if existing:
                return jsonify({'error': 'Ya existe una categoría con ese nombre'}), 409
            
            # Insertar categoría
            categoria_id = db.execute_insert(
                """
                INSERT INTO categorias (usuarioId, nombre, tipo, descripcion, fecha)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (current_user['user_id'], nombre, tipo, descripcion, int(time.time()))
            )
            
            return jsonify({
                'message': 'Categoría creada exitosamente',
                'id': categoria_id,
                'nombre': nombre,
                'tipo': tipo,
                'descripcion': descripcion
            }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['PUT'])
@token_required
def update_categoria(current_user, categoria_id):
    """Actualiza una categoría"""
    try:
        data = request.get_json()
        
        with Database() as db:
            # Verificar que la categoría pertenece al usuario
            categoria = db.execute_one(
                "SELECT id FROM categorias WHERE id = %s AND usuarioId = %s",
                (categoria_id, current_user['user_id'])
            )
            
            if not categoria:
                return jsonify({'error': 'Categoría no encontrada'}), 404
            
            # Construir query de actualización dinámicamente
            updates = []
            params = []
            
            if 'nombre' in data:
                updates.append("nombre = %s")
                params.append(data['nombre'])
            
            if 'descripcion' in data:
                updates.append("descripcion = %s")
                params.append(data['descripcion'])
            
            if not updates:
                return jsonify({'error': 'No hay datos para actualizar'}), 400
            
            params.extend([categoria_id, current_user['user_id']])
            
            query = f"""
                UPDATE categorias
                SET {', '.join(updates)}
                WHERE id = %s AND usuarioId = %s
            """
            
            db.execute_update(query, params)
            
            return jsonify({'message': 'Categoría actualizada exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@categorias_bp.route('/<int:categoria_id>', methods=['DELETE'])
@token_required
def delete_categoria(current_user, categoria_id):
    """Elimina una categoría"""
    try:
        with Database() as db:
            # Verificar que la categoría pertenece al usuario
            categoria = db.execute_one(
                "SELECT id FROM categorias WHERE id = %s AND usuarioId = %s",
                (categoria_id, current_user['user_id'])
            )
            
            if not categoria:
                return jsonify({'error': 'Categoría no encontrada'}), 404
            
            # Verificar si hay movimientos asociados
            movimientos = db.execute_one(
                "SELECT COUNT(*) as count FROM movimientos WHERE categoriaId = %s",
                (categoria_id,)
            )
            
            if movimientos and movimientos['count'] > 0:
                return jsonify({
                    'error': 'No se puede eliminar la categoría porque tiene movimientos asociados'
                }), 409
            
            # Eliminar categoría
            db.execute_delete(
                "DELETE FROM categorias WHERE id = %s AND usuarioId = %s",
                (categoria_id, current_user['user_id'])
            )
            
            return jsonify({'message': 'Categoría eliminada exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
