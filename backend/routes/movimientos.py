from flask import Blueprint, request, jsonify
from database import Database, format_monto
from middleware import token_required
import time

movimientos_bp = Blueprint('movimientos', __name__)

@movimientos_bp.route('/gastos', methods=['GET'])
@token_required
def get_gastos(current_user):
    """Obtiene todos los gastos del usuario"""
    try:
        # Parámetros de filtro opcionales
        categoria_id = request.args.get('categoriaId', type=int)
        fecha_inicio = request.args.get('fechaInicio', type=int)
        fecha_fin = request.args.get('fechaFin', type=int)
        limit = request.args.get('limit', type=int, default=100)
        
        with Database() as db:
            query = """
                SELECT g.id, g.usuarioId, g.categoriaId, g.monto, g.metodo_pago,
                       g.detalle, g.descripcion, g.fecha,
                       c.nombre as categoria_nombre, c.tipo as categoria_tipo
                FROM gastos g
                JOIN categorias c ON g.categoriaId = c.id
                WHERE g.usuarioId = %s
            """
            params = [current_user['user_id']]
            
            if categoria_id:
                query += " AND g.categoriaId = %s"
                params.append(categoria_id)
            
            if fecha_inicio:
                query += " AND g.fecha >= %s"
                params.append(fecha_inicio)
            
            if fecha_fin:
                query += " AND g.fecha <= %s"
                params.append(fecha_fin)
            
            query += " ORDER BY g.fecha DESC LIMIT %s"
            params.append(limit)
            
            gastos = db.execute(query, params)
            
            # Formatear resultados
            result = []
            for gasto in gastos:
                gasto_dict = dict(gasto)
                gasto_dict['monto'] = format_monto(gasto_dict['monto'])
                result.append(gasto_dict)
            
            return jsonify(result), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@movimientos_bp.route('/ingresos', methods=['GET'])
@token_required
def get_ingresos(current_user):
    """Obtiene todos los ingresos del usuario"""
    try:
        # Parámetros de filtro opcionales
        categoria_id = request.args.get('categoriaId', type=int)
        fecha_inicio = request.args.get('fechaInicio', type=int)
        fecha_fin = request.args.get('fechaFin', type=int)
        limit = request.args.get('limit', type=int, default=100)
        
        with Database() as db:
            query = """
                SELECT i.id, i.usuarioId, i.categoriaId, i.monto, i.metodo_pago,
                       i.fuente, i.descripcion, i.fecha,
                       c.nombre as categoria_nombre, c.tipo as categoria_tipo
                FROM ingresos i
                JOIN categorias c ON i.categoriaId = c.id
                WHERE i.usuarioId = %s
            """
            params = [current_user['user_id']]
            
            if categoria_id:
                query += " AND i.categoriaId = %s"
                params.append(categoria_id)
            
            if fecha_inicio:
                query += " AND i.fecha >= %s"
                params.append(fecha_inicio)
            
            if fecha_fin:
                query += " AND i.fecha <= %s"
                params.append(fecha_fin)
            
            query += " ORDER BY i.fecha DESC LIMIT %s"
            params.append(limit)
            
            ingresos = db.execute(query, params)
            
            # Formatear resultados
            result = []
            for ingreso in ingresos:
                ingreso_dict = dict(ingreso)
                ingreso_dict['monto'] = format_monto(ingreso_dict['monto'])
                result.append(ingreso_dict)
            
            return jsonify(result), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@movimientos_bp.route('/gastos', methods=['POST'])
@token_required
def create_gasto(current_user):
    """Crea un nuevo gasto"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required = ['categoriaId', 'monto', 'metodo_pago']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        categoria_id = data['categoriaId']
        monto = data['monto']  # {'cantidad': 100, 'moneda': 'MXN'}
        metodo_pago = data['metodo_pago']
        detalle = data.get('detalle', 'Gasto')
        descripcion = data.get('descripcion', '')
        fecha = data.get('fecha', int(time.time()))
        
        with Database() as db:
            # Verificar que la categoría existe y pertenece al usuario
            categoria = db.execute_one(
                "SELECT id, tipo FROM categorias WHERE id = %s AND usuarioId = %s",
                (categoria_id, current_user['user_id'])
            )
            
            if not categoria:
                return jsonify({'error': 'Categoría no encontrada'}), 404
            
            if categoria['tipo'] != 'gasto':
                return jsonify({'error': 'La categoría debe ser de tipo gasto'}), 400
            
            # Insertar gasto
            gasto_id = db.execute_insert(
                """
                INSERT INTO gastos (usuarioId, categoriaId, monto, metodo_pago, detalle, descripcion, fecha)
                VALUES (%s, %s, ROW(%s, %s)::monto, %s, %s, %s, %s)
                """,
                (current_user['user_id'], categoria_id, monto['cantidad'], monto.get('moneda', 'MXN'),
                 metodo_pago, detalle, descripcion, fecha)
            )
            
            return jsonify({
                'message': 'Gasto creado exitosamente',
                'id': gasto_id
            }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@movimientos_bp.route('/ingresos', methods=['POST'])
@token_required
def create_ingreso(current_user):
    """Crea un nuevo ingreso"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        required = ['categoriaId', 'monto', 'metodo_pago']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        categoria_id = data['categoriaId']
        monto = data['monto']
        metodo_pago = data['metodo_pago']
        fuente = data.get('fuente', 'Ingreso')
        descripcion = data.get('descripcion', '')
        fecha = data.get('fecha', int(time.time()))
        
        with Database() as db:
            # Verificar que la categoría existe y pertenece al usuario
            categoria = db.execute_one(
                "SELECT id, tipo FROM categorias WHERE id = %s AND usuarioId = %s",
                (categoria_id, current_user['user_id'])
            )
            
            if not categoria:
                return jsonify({'error': 'Categoría no encontrada'}), 404
            
            if categoria['tipo'] != 'ingreso':
                return jsonify({'error': 'La categoría debe ser de tipo ingreso'}), 400
            
            # Insertar ingreso
            ingreso_id = db.execute_insert(
                """
                INSERT INTO ingresos (usuarioId, categoriaId, monto, metodo_pago, fuente, descripcion, fecha)
                VALUES (%s, %s, ROW(%s, %s)::monto, %s, %s, %s, %s)
                """,
                (current_user['user_id'], categoria_id, monto['cantidad'], monto.get('moneda', 'MXN'),
                 metodo_pago, fuente, descripcion, fecha)
            )
            
            return jsonify({
                'message': 'Ingreso creado exitosamente',
                'id': ingreso_id
            }), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@movimientos_bp.route('/gastos/<int:gasto_id>', methods=['DELETE'])
@token_required
def delete_gasto(current_user, gasto_id):
    """Elimina un gasto"""
    try:
        with Database() as db:
            rows = db.execute_delete(
                "DELETE FROM gastos WHERE id = %s AND usuarioId = %s",
                (gasto_id, current_user['user_id'])
            )
            
            if rows == 0:
                return jsonify({'error': 'Gasto no encontrado'}), 404
            
            return jsonify({'message': 'Gasto eliminado exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@movimientos_bp.route('/ingresos/<int:ingreso_id>', methods=['DELETE'])
@token_required
def delete_ingreso(current_user, ingreso_id):
    """Elimina un ingreso"""
    try:
        with Database() as db:
            rows = db.execute_delete(
                "DELETE FROM ingresos WHERE id = %s AND usuarioId = %s",
                (ingreso_id, current_user['user_id'])
            )
            
            if rows == 0:
                return jsonify({'error': 'Ingreso no encontrado'}), 404
            
            return jsonify({'message': 'Ingreso eliminado exitosamente'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@movimientos_bp.route('/resumen', methods=['GET'])
@token_required
def get_resumen(current_user):
    """Obtiene un resumen de ingresos y gastos"""
    try:
        with Database() as db:
            # Obtener balance del usuario
            balance = db.execute_one(
                "SELECT * FROM vista_balance_usuarios WHERE usuario_id = %s",
                (current_user['user_id'],)
            )
            
            if not balance:
                return jsonify({
                    'total_ingresos': 0,
                    'total_gastos': 0,
                    'balance': 0
                }), 200
            
            return jsonify(dict(balance)), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
