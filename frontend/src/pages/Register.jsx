import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        nombre_completo: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        const { confirmPassword, ...userData } = formData;
        const result = await register(userData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-background"></div>

            <div className="login-container">
                <div className="login-card glass-card">
                    <div className="login-header">
                        <div className="login-logo">💰</div>
                        <h1>Crear Cuenta</h1>
                        <p>Regístrate para comenzar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                className="input"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Elige un nombre de usuario"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nombre_completo">Nombre Completo</label>
                            <input
                                id="nombre_completo"
                                name="nombre_completo"
                                type="text"
                                className="input"
                                value={formData.nombre_completo}
                                onChange={handleChange}
                                placeholder="Tu nombre completo"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="input"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className="input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </button>

                        <div className="login-footer">
                            <p>
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="link">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
