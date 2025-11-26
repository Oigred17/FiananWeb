# Guía de Inicio Rápido

##  Instalación Rápida

### 1. Base de Datos
**Windows:**
```powershell
.\crearbase.ps1
```

**Linux / Mac:**
```bash
./crear.sh
```

### 2. Backend
```bash
cd backend
# Windows:
python -m venv venv
.\venv\Scripts\Activate.ps1
# Linux/Mac:
# python3 -m venv venv
# source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Acceder
- **App**: http://localhost:5173
- **Usuario**: `demo`
- **Password**: `password123`
