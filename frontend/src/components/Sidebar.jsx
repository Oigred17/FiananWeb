import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
    FiHome,
    FiDollarSign,
    FiTag,
    FiPieChart,
    FiTarget,
    FiChevronDown,
    FiTrendingUp
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const [expandedSection, setExpandedSection] = useState(null);

    const menuSections = [
        {
            title: 'Principal',
            items: [
                { path: '/dashboard', icon: FiHome, label: 'Dashboard' }
            ]
        },
        {
            title: 'Gestión',
            items: [
                { path: '/transactions', icon: FiDollarSign, label: 'Transacciones' },
                { path: '/categories', icon: FiTag, label: 'Categorías' }
            ]
        },
        {
            title: 'Planificación',
            items: [
                { path: '/budgets', icon: FiPieChart, label: 'Presupuestos' },
                { path: '/goals', icon: FiTarget, label: 'Metas' }
            ]
        }
    ];

    const toggleSection = (index) => {
        setExpandedSection(expandedSection === index ? null : index);
    };

    return (
        <aside className="sidebar glass-card">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">💰</div>
                    <div className="logo-text">
                        <h2>FinApp</h2>
                        <p className="logo-subtitle">Finanzas Personales</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuSections.map((section, index) => (
                    <div key={index} className="nav-section">
                        <button
                            className="nav-section-title"
                            onClick={() => toggleSection(index)}
                        >
                            <span>{section.title}</span>
                            <FiChevronDown
                                size={16}
                                className={`chevron ${expandedSection === index ? 'expanded' : ''}`}
                            />
                        </button>
                        <div
                            className={`nav-section-items ${
                                expandedSection === index ? 'expanded' : ''
                            }`}
                        >
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <div className="link-icon-wrapper">
                                        <item.icon size={18} />
                                    </div>
                                    <span className="link-label">{item.label}</span>
                                    {item.path === '/dashboard' && (
                                        <div className="link-badge">
                                            <FiTrendingUp size={12} />
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        
        </aside>
    );
};

export default Sidebar;
