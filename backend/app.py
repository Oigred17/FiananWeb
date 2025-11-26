from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db_pool, close_db_pool
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS
CORS(app, resources={
    r"/api/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Importar blueprints
from routes.auth import auth_bp
from routes.categorias import categorias_bp
from routes.movimientos import movimientos_bp
from routes.presupuestos import presupuestos_bp
from routes.metas import metas_bp

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(categorias_bp, url_prefix='/api/categorias')
app.register_blueprint(movimientos_bp, url_prefix='/api/movimientos')
app.register_blueprint(presupuestos_bp, url_prefix='/api/presupuestos')
app.register_blueprint(metas_bp, url_prefix='/api/metas')

# Ruta de prueba
@app.route('/')
def index():
    return jsonify({
        'message': 'API de Gestión Financiera',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'categorias': '/api/categorias',
            'movimientos': '/api/movimientos',
            'presupuestos': '/api/presupuestos',
            'metas': '/api/metas'
        }
    })

# Ruta de health check
@app.route('/health')
def health():
    return jsonify({'status': 'ok'}), 200

# Manejador de errores 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint no encontrado'}), 404

# Manejador de errores 500
@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Error interno del servidor: {error}')
    return jsonify({'error': 'Error interno del servidor'}), 500

# Inicializar pool de conexiones al iniciar la aplicación
@app.before_request
def before_first_request():
    if not hasattr(app, 'db_initialized'):
        try:
            init_db_pool()
            app.db_initialized = True
            logger.info('Aplicación iniciada correctamente')
        except Exception as e:
            logger.error(f'Error al inicializar la aplicación: {e}')
            raise

# Cerrar pool de conexiones al cerrar la aplicación
@app.teardown_appcontext
def shutdown_session(exception=None):
    pass  # El pool se cierra cuando termina la aplicación

if __name__ == '__main__':
    try:
        # Inicializar pool de conexiones
        init_db_pool()
        
        # Ejecutar aplicación
        logger.info('Iniciando servidor Flask...')
        logger.info(f'Servidor corriendo en http://localhost:5000')
        logger.info(f'CORS habilitado para: {Config.CORS_ORIGINS}')
        
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=Config.DEBUG
        )
    except KeyboardInterrupt:
        logger.info('Servidor detenido por el usuario')
    except Exception as e:
        logger.error(f'Error al iniciar el servidor: {e}')
    finally:
        close_db_pool()
        logger.info('Pool de conexiones cerrado')
