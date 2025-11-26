#!/bin/bash

# Script para resetear la base de datos en Linux/Mac
echo -e "\033[1;33mResetear base de datos...\033[0m"

# Configurar contraseña de PostgreSQL si es necesaria
# export PGPASSWORD="tu_password"

# Ejecutar scripts SQL
echo "Ejecutando init_database.sql..."
psql -U postgres -f database/init_database.sql


