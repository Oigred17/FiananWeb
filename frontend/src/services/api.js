import axios from 'axios';

// Crear instancia de axios
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Servicios de autenticación
export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me')
};

// Servicios de categorías
export const categoriasService = {
    getAll: (tipo) => api.get('/categorias', { params: { tipo } }),
    create: (categoria) => api.post('/categorias', categoria),
    update: (id, categoria) => api.put(`/categorias/${id}`, categoria),
    delete: (id) => api.delete(`/categorias/${id}`)
};

// Servicios de movimientos
export const movimientosService = {
    getGastos: (params) => api.get('/movimientos/gastos', { params }),
    getIngresos: (params) => api.get('/movimientos/ingresos', { params }),
    createGasto: (gasto) => api.post('/movimientos/gastos', gasto),
    createIngreso: (ingreso) => api.post('/movimientos/ingresos', ingreso),
    deleteGasto: (id) => api.delete(`/movimientos/gastos/${id}`),
    deleteIngreso: (id) => api.delete(`/movimientos/ingresos/${id}`),
    getResumen: () => api.get('/movimientos/resumen')
};

// Servicios de presupuestos
export const presupuestosService = {
    getAll: () => api.get('/presupuestos'),
    create: (presupuesto) => api.post('/presupuestos', presupuesto),
    update: (id, presupuesto) => api.put(`/presupuestos/${id}`, presupuesto),
    delete: (id) => api.delete(`/presupuestos/${id}`),
    getEstado: (id) => api.get(`/presupuestos/${id}/estado`),
    getTodosEstados: () => api.get('/presupuestos/estados')
};

// Servicios de metas
export const metasService = {
    getAll: () => api.get('/metas'),
    create: (meta) => api.post('/metas', meta),
    update: (id, meta) => api.put(`/metas/${id}`, meta),
    delete: (id) => api.delete(`/metas/${id}`),
    contribuir: (id, cantidad) => api.post(`/metas/${id}/contribuir`, { cantidad })
};

export default api;
