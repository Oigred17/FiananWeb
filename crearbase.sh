#!/bin/bash

# Script para resetear la base de datos en Linux/Mac
echo -e "\033[1;33mResetear base de datos...\033[0m"

# Configurar contraseña de PostgreSQL si es necesaria
# export PGPASSWORD="tu_password"

# Ejecutar scripts SQL
echo "Ejecutando init_database.sql..."
psql -U postgres -f database/init_database.sql

if [ $? -eq 0 ]; then
    echo "Ejecutando seed_data.sql..."
    psql -U postgres -f database/seed_data.sql
    
    if [ $? -eq 0 ]; then
        echo -e "\033[1;32m✅ Base de datos reseteada exitosamente\033[0m"
    else
        echo -e "\033[1;31m❌ Error al ejecutar seed_data.sql\033[0m"
        exit 1
    fi
else
    echo -e "\033[1;31m❌ Error al ejecutar init_database.sql\033[0m"
    exit 1
fi
