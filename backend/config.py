import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración de la aplicación"""
    
    # Configuración de Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # Configuración de la base de datos PostgreSQL
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'finanzas')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '221122')
    
    # Configuración de JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRATION_HOURS = 24
    
    # Configuración de CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    @staticmethod
    def get_db_connection_string():
        """Retorna la cadena de conexión a la base de datos"""
        return f"host={Config.DB_HOST} port={Config.DB_PORT} dbname={Config.DB_NAME} user={Config.DB_USER} password={Config.DB_PASSWORD}"
