from flask import Blueprint, request, jsonify
from database import Database, format_monto
from middleware import token_required
import time

metas_bp = Blueprint('metas', __name__)

@metas_bp.route('', methods=['GET'])
@token_required
def get_metas(current_user):
    """Obtiene todas las metas de ahorro del usuario"""
    try:
        with Database() as db:
            metas = db.execute(
                """
                SELECT id, usuarioId, nombre, descripcion, monto_objetivo, monto_actual,
                       fecha_limite, fecha_creacion
                FROM metas
                WHERE usuarioId = %s
                ORDER BY fecha_creacion DESC
                """,
                (current_user['user_id'],)
            )
            
            # Formatear resultados y calcular progreso
            result = []
            for meta in metas:
                meta_dict = dict(meta)
                meta_dict['monto_objetivo'] = format_monto(meta_dict['monto_objetivo'])
                meta_dict['monto_actual'] = format_monto(meta_dict['monto_actual'])
                
                # Calcular porcentaje de progreso
                objetivo = meta_dict['monto_objetivo']['cantidad']
                actual = meta_dict['monto_actual']['cantidad']
                meta_dict['progreso'] = (actual / objetivo * 100) if objetivo > 0 else 0
                meta_dict['completada'] = actual >= objetivo
                
                result.append(meta_dict)
            
            return jsonify(result), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@metas_bp.route('', methods=['POST'])
@token_required
def create_meta(current_user):
    """Crea una nueva meta de ahorro"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required = ['nombre', 'monto_objetivo']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        nombre = data['nombre']
        descripcion = data.get('descripcion', '')
        monto_objetivo = data['monto_objetivo']  # {'cantidad': 50000, 'moneda': 'MXN'}
        monto_actual = data.get('monto_actual', {'cantidad': 0, 'moneda': 'MXN'})
        fecha_limite = data.get('fecha_limite')
        
        with Database() as db:
            # Insertar meta
            meta_id = db.execute_insert(
                """
                INSERT INTO metas (usuarioId, nombre, descripcion, monto_objetivo, monto_actual,
                                   fecha_limite, fecha_creacion)
                VALUES (%s, %s, %s, ROW(%s, %s)::monto, ROW(%s, %s)::monto, %s, %s)
                """,
                (current_user['user_id'], nombre, descripcion,
                 monto_objetivo['cantidad'], monto_objetivo.get('moneda', 'MXN'),
                 monto_actual['cantidad'], monto_actual.get('moneda', 'MXN'),
                 fecha_limite, int(time.time()))
            )
            
            return jsonify({
                'message': 'Meta creada exitosamente',
                'id': meta_id
            }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@metas_bp.route('/<int:meta_id>', methods=['PUT'])
@token_required
def update_meta(current_user, meta_id):
    """Actualiza una meta de ahorro"""
    try:
        data = request.get_json()
        
        with Database() as db:
            # Verificar que la meta pertenece al usuario
            meta = db.execute_one(
                "SELECT id FROM metas WHERE id = %s AND usuarioId = %s",
                (meta_id, current_user['user_id'])
            )
            
            if not meta:
                return jsonify({'error': 'Meta no encontrada'}), 404
            
            # Construir query de actualización dinámicamente
            updates = []
            params = []
            
            if 'nombre' in data:
                updates.append("nombre = %s")
                params.append(data['nombre'])
            
            if 'descripcion' in data:
                updates.append("descripcion = %s")
                params.append(data['descripcion'])
            
            if 'monto_objetivo' in data:
                monto = data['monto_objetivo']
                updates.append("monto_objetivo = ROW(%s, %s)::monto")
                params.extend([monto['cantidad'], monto.get('moneda', 'MXN')])
            
            if 'fecha_limite' in data:
                updates.append("fecha_limite = %s")
                params.append(data['fecha_limite'])
            
            if not updates:
                return jsonify({'error': 'No hay datos para actualizar'}), 400
            
            params.extend([meta_id, current_user['user_id']])
            
            query = f"""
                UPDATE metas
                SET {', '.join(updates)}
                WHERE id = %s AND usuarioId = %s
            """
            
            db.execute_update(query, params)
            
            return jsonify({'message': 'Meta actualizada exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@metas_bp.route('/<int:meta_id>/contribuir', methods=['POST'])
@token_required
def contribuir_meta(current_user, meta_id):
    """Añade una contribución a una meta de ahorro"""
    try:
        data = request.get_json()
        
        if 'cantidad' not in data:
            return jsonify({'error': 'Cantidad requerida'}), 400
        
        cantidad = data['cantidad']
        
        with Database() as db:
            # Verificar que la meta pertenece al usuario y obtener monto actual
            meta = db.execute_one(
                "SELECT id, monto_actual FROM metas WHERE id = %s AND usuarioId = %s",
                (meta_id, current_user['user_id'])
            )
            
            if not meta:
                return jsonify({'error': 'Meta no encontrada'}), 404
            
            # Obtener monto actual
            monto_actual = format_monto(meta['monto_actual'])
            nuevo_monto = monto_actual['cantidad'] + cantidad
            
            # Actualizar monto actual
            db.execute_update(
                """
                UPDATE metas
                SET monto_actual = ROW(%s, %s)::monto
                WHERE id = %s AND usuarioId = %s
                """,
                (nuevo_monto, monto_actual['moneda'], meta_id, current_user['user_id'])
            )
            
            return jsonify({
                'message': 'Contribución añadida exitosamente',
                'nuevo_monto': nuevo_monto
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@metas_bp.route('/<int:meta_id>', methods=['DELETE'])
@token_required
def delete_meta(current_user, meta_id):
    """Elimina una meta de ahorro"""
    try:
        with Database() as db:
            rows = db.execute_delete(
                "DELETE FROM metas WHERE id = %s AND usuarioId = %s",
                (meta_id, current_user['user_id'])
            )
            
            if rows == 0:
                return jsonify({'error': 'Meta no encontrada'}), 404
            
            return jsonify({'message': 'Meta eliminada exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
