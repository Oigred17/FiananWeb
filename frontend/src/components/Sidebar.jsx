import { NavLink } from 'react-router-dom';
import {
    FiHome,
    FiDollarSign,
    FiTag,
    FiPieChart,
    FiTarget
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const menuItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { path: '/transactions', icon: FiDollarSign, label: 'Transacciones' },
        { path: '/categories', icon: FiTag, label: 'Categorías' },
        { path: '/budgets', icon: FiPieChart, label: 'Presupuestos' },
        { path: '/goals', icon: FiTarget, label: 'Metas' }
    ];

    return (
        <aside className="sidebar glass-card">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">💰</div>
                    <h2>FinApp</h2>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
