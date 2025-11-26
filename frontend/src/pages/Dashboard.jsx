import { useState, useEffect } from 'react';
import { movimientosService, presupuestosService } from '../services/api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [resumen, setResumen] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [ingresos, setIngresos] = useState([]);
    const [presupuestos, setPresupuestos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resumenRes, gastosRes, ingresosRes, presupuestosRes] = await Promise.all([
                movimientosService.getResumen(),
                movimientosService.getGastos({ limit: 5 }),
                movimientosService.getIngresos({ limit: 5 }),
                presupuestosService.getTodosEstados()
            ]);

            setResumen(resumenRes.data);
            setGastos(gastosRes.data);
            setIngresos(ingresosRes.data);
            setPresupuestos(presupuestosRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#10B981', '#EF4444'];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Resumen de tus finanzas</p>
            </div>

            {/* Cards de resumen */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                        <FiTrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Ingresos</p>
                        <h2 className="stat-value">{formatCurrency(resumen?.total_ingresos)}</h2>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--gradient-secondary)' }}>
                        <FiTrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Gastos</p>
                        <h2 className="stat-value">{formatCurrency(resumen?.total_gastos)}</h2>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                        <FiDollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Balance</p>
                        <h2 className="stat-value" style={{
                            color: resumen?.balance >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                        }}>
                            {formatCurrency(resumen?.balance)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Gráficos y transacciones recientes */}
            <div className="dashboard-grid">
                <div className="dashboard-section glass-card">
                    <h3>Transacciones Recientes</h3>
                    <div className="transactions-list">
                        {gastos.slice(0, 5).map((gasto) => (
                            <div key={gasto.id} className="transaction-item">
                                <div>
                                    <p className="transaction-desc">{gasto.detalle}</p>
                                    <span className="transaction-category">{gasto.categoria_nombre}</span>
                                </div>
                                <span className="transaction-amount expense">
                                    -{formatCurrency(gasto.monto.cantidad)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section glass-card">
                    <h3>Estado de Presupuestos</h3>
                    <div className="budgets-list">
                        {presupuestos.slice(0, 4).map((presupuesto) => (
                            <div key={presupuesto.id} className="budget-item">
                                <div className="budget-header">
                                    <span>{presupuesto.categoria_nombre}</span>
                                    <span>{formatCurrency(presupuesto.gastado)} / {formatCurrency(presupuesto.limite)}</span>
                                </div>
                                <div className="budget-progress">
                                    <div
                                        className="budget-progress-bar"
                                        style={{
                                            width: `${Math.min((presupuesto.gastado / presupuesto.limite) * 100, 100)}%`,
                                            background: presupuesto.estado === 'excedido' ? 'var(--error-color)' :
                                                presupuesto.estado === 'alerta' ? 'var(--warning-color)' :
                                                    'var(--success-color)'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
