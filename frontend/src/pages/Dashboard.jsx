import { useState, useEffect } from 'react';
import { movimientosService, presupuestosService } from '../services/api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiSend, FiArrowDown, FiArrowUp, FiCreditCard, FiTarget } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const [resumen, setResumen] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [ingresos, setIngresos] = useState([]);
    const [presupuestos, setPresupuestos] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [resumenRes, gastosRes, ingresosRes, presupuestosRes] = await Promise.all([
                movimientosService.getResumen(),
                movimientosService.getGastos({ limit: 10 }),
                movimientosService.getIngresos({ limit: 10 }),
                presupuestosService.getTodosEstados()
            ]);

            setResumen(resumenRes.data);
            setGastos(gastosRes.data);
            setIngresos(ingresosRes.data);
            setPresupuestos(presupuestosRes.data);

            // Procesar datos para gráficos
            procesarDatosGraficos(gastosRes.data, presupuestosRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const procesarDatosGraficos = (gastosData, presupuestosData) => {
        // Gráfico de últimas 7 transacciones
        const ultimasTransacciones = gastosData.slice(0, 7).reverse().map((gasto) => ({
            nombre: gasto.detalle.substring(0, 10),
            monto: gasto.monto.cantidad,
            fecha: new Date(gasto.fecha).toLocaleDateString('es-MX', { month: '2-digit', day: '2-digit' })
        }));
        setChartData(ultimasTransacciones);

        // Gráfico de gastos por categoría
        const gastosPorCategoria = presupuestosData.map((p) => ({
            name: p.categoria_nombre,
            value: p.gastado,
            limite: p.limite
        }));
        setCategoryData(gastosPorCategoria);
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

    const COLORS = ['#4F46E5', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

    const getTotalExpensePercentage = () => {
        if (!resumen) return 0;
        const total = (resumen?.total_ingresos || 0) + (resumen?.total_gastos || 0);
        if (total === 0) return 0;
        return Math.round(((resumen?.total_gastos || 0) / total) * 100);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Bienvenido de Vuelta</h1>
                    <p>Aquí está el resumen de tus finanzas</p>
                </div>
                <div className="header-actions">
                    <button className="btn-header btn-send">
                        <FiSend size={18} />
                        <span>Enviar</span>
                    </button>
                </div>
            </div>

            {/* Tarjeta Principal - Balance */}
            <div className="balance-card-container">
                <div className="balance-card">
                    <div className="balance-card-header">
                        <div className="balance-card-info">
                            <h2 style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Balance Total</h2>
                            <h2 className="balance-amount">{formatCurrency(resumen?.balance)}</h2>
                        </div>
                        <div className="balance-card-logo">
                            <FiCreditCard size={32} />
                        </div>
                    </div>
                    <div className="balance-card-footer">
                        <div className="card-detail">
                            <span className="card-label">Ingresos</span>
                            <span className="card-value income">{formatCurrency(resumen?.total_ingresos)}</span>
                        </div>
                        <div className="card-detail">
                            <span className="card-label">Gastos</span>
                            <span className="card-value expense">{formatCurrency(resumen?.total_gastos)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Cards principales */}
            <div className="stats-grid">
                <div className="stat-card stat-card-highlight">
                    <div className="stat-card-top">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                            <FiTrendingUp size={24} />
                        </div>
                        <span className="stat-badge">+2.5%</span>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Ingresos</p>
                        <h3 className="stat-value">{formatCurrency(resumen?.total_ingresos)}</h3>
                    </div>
                </div>

                <div className="stat-card stat-card-highlight">
                    <div className="stat-card-top">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
                            <FiTrendingDown size={24} />
                        </div>
                        <span className="stat-badge">{getTotalExpensePercentage()}%</span>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Gastos</p>
                        <h3 className="stat-value">{formatCurrency(resumen?.total_gastos)}</h3>
                    </div>
                </div>

                <div className="stat-card stat-card-highlight">
                    <div className="stat-card-top">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #017a8d 0%, #029ba8 100%)' }}>
                            <FiTarget size={24} />
                        </div>
                        <span className="stat-badge">{presupuestos.length}</span>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Presupuestos Activos</p>
                        <h3 className="stat-value">{presupuestos.filter(p => p.estado !== 'excedido').length}/{presupuestos.length}</h3>
                    </div>
                </div>
            </div>

            {/* Gráficos principales */}
            <div className="charts-grid">
                {/* Gráfico de línea - Tendencia de gastos */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Gastos Recientes</h3>
                        <span className="chart-period">Últimas transacciones</span>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="fecha" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="monto" stroke="#EF4444" fillOpacity={1} fill="url(#colorMonto)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">No hay datos disponibles</div>
                    )}
                </div>

                {/* Gráfico de pastel - Gastos por categoría */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Gastos por Categoría</h3>
                        <span className="chart-period">Distribución actual</span>
                    </div>
                    {categoryData.length > 0 ? (
                        <div className="pie-chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="empty-state">No hay datos disponibles</div>
                    )}
                </div>
            </div>

            {/* Sección de transacciones y presupuestos */}
            <div className="dashboard-grid">
                {/* Transacciones Recientes */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>Transacciones Recientes</h3>
                        <a href="/transactions" className="see-all">Ver todas</a>
                    </div>
                    <div className="transactions-list">
                        {gastos.slice(0, 5).map((gasto) => (
                            <div key={gasto.id} className="transaction-item">
                                <div className="transaction-left">
                                    <div className="transaction-icon expense-icon">
                                        <FiArrowDown size={18} />
                                    </div>
                                    <div className="transaction-info">
                                        <p className="transaction-desc">{gasto.detalle}</p>
                                        <span className="transaction-category">{gasto.categoria_nombre}</span>
                                    </div>
                                </div>
                                <span className="transaction-amount expense">
                                    -{formatCurrency(gasto.monto.cantidad)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Estado de Presupuestos */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>Estado de Presupuestos</h3>
                        <a href="/budgets" className="see-all">Gestionar</a>
                    </div>
                    <div className="budgets-list">
                        {presupuestos.slice(0, 4).map((presupuesto) => {
                            const percentage = Math.min((presupuesto.gastado / presupuesto.limite) * 100, 100);
                            const estado = percentage >= 100 ? 'excedido' : percentage >= 80 ? 'alerta' : 'normal';
                            
                            return (
                                <div key={presupuesto.id} className="budget-item">
                                    <div className="budget-header">
                                        <div>
                                            <span className="budget-name">{presupuesto.categoria_nombre}</span>
                                            <div className="budget-stats">
                                                <span className="budget-amount">{formatCurrency(presupuesto.gastado)}</span>
                                                <span className="budget-divider">/</span>
                                                <span className="budget-limit">{formatCurrency(presupuesto.limite)}</span>
                                            </div>
                                        </div>
                                        <span className={`budget-status ${estado}`}>{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="budget-progress">
                                        <div
                                            className={`budget-progress-bar ${estado}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
