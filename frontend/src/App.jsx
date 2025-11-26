import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Layout from './components/Layout';
import './index.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para rutas públicas (redirige al dashboard si ya está autenticado)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />

                    {/* Rutas protegidas */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="budgets" element={<Budgets />} />
                        <Route path="goals" element={<Goals />} />
                    </Route>

                    {/* Ruta por defecto */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
