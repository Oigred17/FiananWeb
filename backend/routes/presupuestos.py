from flask import Blueprint, request, jsonify
from database import Database, format_monto
from middleware import token_required
import time

presupuestos_bp = Blueprint('presupuestos', __name__)

@presupuestos_bp.route('', methods=['GET'])
@token_required
def get_presupuestos(current_user):
    """Obtiene todos los presupuestos del usuario"""
    try:
        with Database() as db:
            presupuestos = db.execute(
                """
                SELECT p.id, p.usuarioId, p.categoriaId, p.monto_max, p.periodo, p.fecha_creacion,
                       c.nombre as categoria_nombre
                FROM presupuestos p
                JOIN categorias c ON p.categoriaId = c.id
                WHERE p.usuarioId = %s
                ORDER BY p.fecha_creacion DESC
                """,
                (current_user['user_id'],)
            )
            
            # Formatear resultados
            result = []
            for presupuesto in presupuestos:
                p_dict = dict(presupuesto)
                p_dict['monto_max'] = format_monto(p_dict['monto_max'])
                result.append(p_dict)
            
            return jsonify(result), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@presupuestos_bp.route('', methods=['POST'])
@token_required
def create_presupuesto(current_user):
    """Crea un nuevo presupuesto"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required = ['categoriaId', 'monto_max', 'periodo']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        categoria_id = data['categoriaId']
        monto_max = data['monto_max']  # {'cantidad': 5000, 'moneda': 'MXN'}
        periodo = data['periodo']  # 'mensual', 'semanal', 'anual'
        
        # Validar periodo
        if periodo not in ['mensual', 'semanal', 'anual']:
            return jsonify({'error': 'Periodo debe ser mensual, semanal o anual'}), 400
        
        with Database() as db:
            # Verificar que la categoría existe y pertenece al usuario
            categoria = db.execute_one(
                "SELECT id FROM categorias WHERE id = %s AND usuarioId = %s",
                (categoria_id, current_user['user_id'])
            )
            
            if not categoria:
                return jsonify({'error': 'Categoría no encontrada'}), 404
            
            # Verificar si ya existe un presupuesto para esta categoría y periodo
            existing = db.execute_one(
                """
                SELECT id FROM presupuestos
                WHERE usuarioId = %s AND categoriaId = %s AND periodo = %s
                """,
                (current_user['user_id'], categoria_id, periodo)
            )
            
            if existing:
                return jsonify({
                    'error': 'Ya existe un presupuesto para esta categoría y periodo'
                }), 409
            
            # Insertar presupuesto
            presupuesto_id = db.execute_insert(
                """
                INSERT INTO presupuestos (usuarioId, categoriaId, monto_max, periodo, fecha_creacion)
                VALUES (%s, %s, ROW(%s, %s)::monto, %s, %s)
                """,
                (current_user['user_id'], categoria_id, monto_max['cantidad'],
                 monto_max.get('moneda', 'MXN'), periodo, int(time.time()))
            )
            
            return jsonify({
                'message': 'Presupuesto creado exitosamente',
                'id': presupuesto_id
            }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@presupuestos_bp.route('/<int:presupuesto_id>', methods=['PUT'])
@token_required
def update_presupuesto(current_user, presupuesto_id):
    """Actualiza un presupuesto"""
    try:
        data = request.get_json()
        
        with Database() as db:
            # Verificar que el presupuesto pertenece al usuario
            presupuesto = db.execute_one(
                "SELECT id FROM presupuestos WHERE id = %s AND usuarioId = %s",
                (presupuesto_id, current_user['user_id'])
            )
            
            if not presupuesto:
                return jsonify({'error': 'Presupuesto no encontrado'}), 404
            
            # Actualizar monto_max si se proporciona
            if 'monto_max' in data:
                monto_max = data['monto_max']
                db.execute_update(
                    """
                    UPDATE presupuestos
                    SET monto_max = ROW(%s, %s)::monto
                    WHERE id = %s AND usuarioId = %s
                    """,
                    (monto_max['cantidad'], monto_max.get('moneda', 'MXN'),
                     presupuesto_id, current_user['user_id'])
                )
            
            return jsonify({'message': 'Presupuesto actualizado exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@presupuestos_bp.route('/<int:presupuesto_id>', methods=['DELETE'])
@token_required
def delete_presupuesto(current_user, presupuesto_id):
    """Elimina un presupuesto"""
    try:
        with Database() as db:
            rows = db.execute_delete(
                "DELETE FROM presupuestos WHERE id = %s AND usuarioId = %s",
                (presupuesto_id, current_user['user_id'])
            )
            
            if rows == 0:
                return jsonify({'error': 'Presupuesto no encontrado'}), 404
            
            return jsonify({'message': 'Presupuesto eliminado exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@presupuestos_bp.route('/<int:presupuesto_id>/estado', methods=['GET'])
@token_required
def get_estado_presupuesto(current_user, presupuesto_id):
    """Obtiene el estado actual de un presupuesto (gastado vs límite)"""
    try:
        with Database() as db:
            # Verificar que el presupuesto pertenece al usuario
            presupuesto = db.execute_one(
                "SELECT id FROM presupuestos WHERE id = %s AND usuarioId = %s",
                (presupuesto_id, current_user['user_id'])
            )
            
            if not presupuesto:
                return jsonify({'error': 'Presupuesto no encontrado'}), 404
            
            # Obtener estado del presupuesto
            estado = db.execute_one(
                "SELECT * FROM vista_estado_presupuestos WHERE id = %s",
                (presupuesto_id,)
            )
            
            if not estado:
                return jsonify({'error': 'No se pudo obtener el estado del presupuesto'}), 500
            
            return jsonify(dict(estado)), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@presupuestos_bp.route('/estados', methods=['GET'])
@token_required
def get_todos_estados(current_user):
    """Obtiene el estado de todos los presupuestos del usuario"""
    try:
        with Database() as db:
            estados = db.execute(
                "SELECT * FROM vista_estado_presupuestos WHERE usuarioId = %s",
                (current_user['user_id'],)
            )
            
            return jsonify([dict(estado) for estado in estados]), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
