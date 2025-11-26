import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut } from 'react-icons/fi';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header glass-card">
            <div className="header-content">
                <div className="header-title">
                    <h1>Gestión Financiera</h1>
                </div>

                <div className="header-actions">
                    <div className="user-info">
                        <FiUser size={20} />
                        <span>{user?.nombre_completo || user?.username}</span>
                    </div>

                    <button onClick={logout} className="btn btn-secondary">
                        <FiLogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
