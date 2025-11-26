import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from config import Config
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pool de conexiones
connection_pool = None

def init_db_pool():
    """Inicializa el pool de conexiones a la base de datos"""
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 20,  # min y max conexiones
            Config.get_db_connection_string()
        )
        logger.info("Pool de conexiones a la base de datos inicializado correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar el pool de conexiones: {e}")
        raise

def get_db_connection():
    """Obtiene una conexión del pool"""
    if connection_pool:
        return connection_pool.getconn()
    else:
        raise Exception("El pool de conexiones no está inicializado")

def return_db_connection(conn):
    """Devuelve una conexión al pool"""
    if connection_pool:
        connection_pool.putconn(conn)

def close_db_pool():
    """Cierra todas las conexiones del pool"""
    if connection_pool:
        connection_pool.closeall()
        logger.info("Pool de conexiones cerrado")

class Database:
    """Clase para manejar operaciones de base de datos"""
    
    def __init__(self):
        self.conn = None
        self.cursor = None
    
    def __enter__(self):
        """Context manager - entrada"""
        self.conn = get_db_connection()
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager - salida"""
        if exc_type is not None:
            # Si hubo un error, hacer rollback
            self.conn.rollback()
            logger.error(f"Error en transacción: {exc_val}")
        else:
            # Si todo salió bien, hacer commit
            self.conn.commit()
        
        # Cerrar cursor y devolver conexión al pool
        if self.cursor:
            self.cursor.close()
        if self.conn:
            return_db_connection(self.conn)
    
    def execute(self, query, params=None):
        """Ejecuta una consulta y retorna los resultados"""
        try:
            self.cursor.execute(query, params)
            # Solo hacer fetch si la consulta devuelve resultados (SELECT)
            if self.cursor.description:
                return self.cursor.fetchall()
            else:
                # Para INSERT/UPDATE/DELETE sin RETURNING
                return []
        except Exception as e:
            logger.error(f"Error ejecutando query: {e}")
            logger.error(f"Query: {query}")
            logger.error(f"Params: {params}")
            raise
    
    def execute_one(self, query, params=None):
        """Ejecuta una consulta y retorna un solo resultado"""
        try:
            self.cursor.execute(query, params)
            # Solo hacer fetch si la consulta devuelve resultados (SELECT)
            if self.cursor.description:
                return self.cursor.fetchone()
            else:
                # Para INSERT/UPDATE/DELETE sin RETURNING
                return None
        except Exception as e:
            logger.error(f"Error ejecutando query: {e}")
            raise
    
    def execute_insert(self, query, params=None):
        """Ejecuta un INSERT y retorna el ID insertado"""
        try:
            self.cursor.execute(query + " RETURNING id", params)
            result = self.cursor.fetchone()
            return result['id'] if result else None
        except Exception as e:
            logger.error(f"Error ejecutando INSERT: {e}")
            raise
    
    def execute_update(self, query, params=None):
        """Ejecuta un UPDATE y retorna el número de filas afectadas"""
        try:
            self.cursor.execute(query, params)
            return self.cursor.rowcount
        except Exception as e:
            logger.error(f"Error ejecutando UPDATE: {e}")
            raise
    
    def execute_delete(self, query, params=None):
        """Ejecuta un DELETE y retorna el número de filas eliminadas"""
        try:
            self.cursor.execute(query, params)
            return self.cursor.rowcount
        except Exception as e:
            logger.error(f"Error ejecutando DELETE: {e}")
            raise

def format_monto(monto_tuple):
    """Convierte una tupla de monto (cantidad, moneda) a diccionario"""
    if monto_tuple and len(monto_tuple) >= 2:
        # Remover paréntesis si existen
        if isinstance(monto_tuple, str):
            monto_tuple = monto_tuple.strip('()').split(',')
        return {
            'cantidad': float(monto_tuple[0]),
            'moneda': monto_tuple[1].strip('"').strip("'")
        }
    return {'cantidad': 0.0, 'moneda': 'MXN'}

def create_monto_string(cantidad, moneda='MXN'):
    """Crea una cadena de monto para insertar en la base de datos"""
    return f"ROW({cantidad}, '{moneda}')::monto"
