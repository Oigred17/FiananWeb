import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="header-title">
                        <h1>Panel de Control</h1>
                        <p className="header-subtitle">Bienvenido de vuelta</p>
                    </div>
                </div>

                <div className="header-center">
                    <div className="search-box">
                        <FiSearch size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Buscar transacciones..." 
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="header-right">
                    
                    <div className="user-profile-wrapper">
                        <button 
                            className="user-profile-btn"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="user-avatar">
                                <span>👤</span>
                            </div>
                            <div className="user-details">
                                <span className="user-name">
                                    {user?.nombre_completo || user?.username}
                                </span>
                                <span className="user-role">Administrador</span>
                            </div>
                        </button>

                        {showUserMenu && (
                            <div className="user-dropdown">
                                <button className="dropdown-item">
                                    <FiUser size={16} />
                                    <span>Mi Perfil</span>
                                </button>
                                <hr className="dropdown-divider" />
                                <button 
                                    className="dropdown-item logout"
                                    onClick={logout}
                                >
                                    <FiLogOut size={16} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
