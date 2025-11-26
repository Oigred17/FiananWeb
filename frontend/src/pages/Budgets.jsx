import { useState, useEffect } from 'react';
import { presupuestosService, categoriasService } from '../services/api';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import '../pages/Transactions.css';

const Budgets = () => {
    const [presupuestos, setPresupuestos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ categoriaId: '', cantidad: '', periodo: 'mensual' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [presRes, catRes] = await Promise.all([
                presupuestosService.getTodosEstados(),
                categoriasService.getAll('gasto')
            ]);
            setPresupuestos(presRes.data);
            setCategorias(catRes.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await presupuestosService.create({
                categoriaId: parseInt(formData.categoriaId),
                monto_max: { cantidad: parseFloat(formData.cantidad), moneda: 'MXN' },
                periodo: formData.periodo
            });
            setShowModal(false);
            setFormData({ categoriaId: '', cantidad: '', periodo: 'mensual' });
            loadData();
        } catch (error) {
            alert(error.response?.data?.error || 'Error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar presupuesto?')) return;
        try {
            await presupuestosService.delete(id);
            loadData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
    };

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h1>Presupuestos</h1>
                    <p>Controla tus gastos</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus size={18} />
                    Nuevo Presupuesto
                </button>
            </div>

            <div className="budgets-grid">
                {presupuestos.map((p) => (
                    <div key={p.id} className="budget-card glass-card">
                        <div className="budget-card-header">
                            <h3>{p.categoria_nombre}</h3>
                            <button className="btn-icon" onClick={() => handleDelete(p.id)}>
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                        <div className="budget-card-body">
                            <div className="budget-amount">
                                <span className="budget-spent">{formatCurrency(p.gastado)}</span>
                                <span className="budget-limit">de {formatCurrency(p.limite)}</span>
                            </div>
                            <div className="budget-progress">
                                <div
                                    className="budget-progress-bar"
                                    style={{
                                        width: `${Math.min((p.gastado / p.limite) * 100, 100)}%`,
                                        background: p.estado === 'excedido' ? 'var(--error-color)' :
                                            p.estado === 'alerta' ? 'var(--warning-color)' :
                                                'var(--success-color)'
                                    }}
                                />
                            </div>
                            <div className="budget-status">
                                <span className={`status-badge ${p.estado}`}>
                                    {p.estado === 'excedido' ? '⚠️ Excedido' :
                                        p.estado === 'alerta' ? '⚡ Alerta' :
                                            '✓ Normal'}
                                </span>
                                <span className="budget-period">{p.periodo}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Nuevo Presupuesto</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Categoría</label>
                                <select className="input" value={formData.categoriaId} onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })} required>
                                    <option value="">Selecciona...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Límite</label>
                                <input type="number" step="0.01" className="input" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Periodo</label>
                                <select className="input" value={formData.periodo} onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}>
                                    <option value="semanal">Semanal</option>
                                    <option value="mensual">Mensual</option>
                                    <option value="anual">Anual</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
