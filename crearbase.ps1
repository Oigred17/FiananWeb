# Script para resetear la base de datos
Write-Host "Resetear base de datos..." -ForegroundColor Yellow

# Configurar encoding para evitar problemas con caracteres especiales
$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Configurar contraseña de PostgreSQL
$env:PGPASSWORD = "221122"

# Buscar psql.exe
Write-Host "Buscando psql.exe..."
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $psqlPath) {
    $psqlPath = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter psql.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

if (-not $psqlPath) {
    Write-Host " No se encontró psql.exe. Por favor asegúrate de tener PostgreSQL instalado." -ForegroundColor Red
    exit 1
}

Write-Host "Usando psql: $psqlPath"

# Ejecutar scripts SQL
Write-Host "Ejecutando init_database.sql..."
& $psqlPath -U postgres -f database\init_database.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "Ejecutando seed_data.sql..."
    & $psqlPath -U postgres -f database\seed_data.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Base de datos reseteada exitosamente" -ForegroundColor Green
    } else {
        Write-Host " Error al ejecutar seed_data.sql" -ForegroundColor Red
    }
} else {
    Write-Host " Error al ejecutar init_database.sql" -ForegroundColor Red
}
