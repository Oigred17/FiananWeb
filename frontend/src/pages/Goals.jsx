import { useState, useEffect } from 'react';
import { metasService } from '../services/api';
import { FiPlus, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import '../pages/Transactions.css';

const Goals = () => {
    const [metas, setMetas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [selectedMeta, setSelectedMeta] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', cantidad: '', fecha_limite: '' });
    const [contribucion, setContribucion] = useState('');

    useEffect(() => {
        loadMetas();
    }, []);

    const loadMetas = async () => {
        try {
            const res = await metasService.getAll();
            setMetas(res.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fechaLimite = formData.fecha_limite ? new Date(formData.fecha_limite).getTime() / 1000 : null;
            await metasService.create({
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                monto_objetivo: { cantidad: parseFloat(formData.cantidad), moneda: 'MXN' },
                fecha_limite: fechaLimite
            });
            setShowModal(false);
            setFormData({ nombre: '', descripcion: '', cantidad: '', fecha_limite: '' });
            loadMetas();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        try {
            await metasService.contribuir(selectedMeta.id, parseFloat(contribucion));
            setShowContributeModal(false);
            setContribucion('');
            loadMetas();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar meta?')) return;
        try {
            await metasService.delete(id);
            loadMetas();
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
                    <h1>Metas de Ahorro</h1>
                    <p>Alcanza tus objetivos</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus size={18} />
                    Nueva Meta
                </button>
            </div>

            <div className="budgets-grid">
                {metas.map((meta) => (
                    <div key={meta.id} className="budget-card glass-card">
                        <div className="budget-card-header">
                            <h3>{meta.nombre}</h3>
                            <button className="btn-icon" onClick={() => handleDelete(meta.id)}>
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                        <div className="budget-card-body">
                            <p className="meta-description">{meta.descripcion}</p>
                            <div className="budget-amount">
                                <span className="budget-spent">{formatCurrency(meta.monto_actual.cantidad)}</span>
                                <span className="budget-limit">de {formatCurrency(meta.monto_objetivo.cantidad)}</span>
                            </div>
                            <div className="budget-progress">
                                <div
                                    className="budget-progress-bar"
                                    style={{
                                        width: `${Math.min(meta.progreso, 100)}%`,
                                        background: meta.completada ? 'var(--success-color)' : 'var(--primary-color)'
                                    }}
                                />
                            </div>
                            <div className="budget-status">
                                <span className="status-badge">
                                    {meta.completada ? '🎉 Completada' : `${meta.progreso.toFixed(0)}%`}
                                </span>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => {
                                        setSelectedMeta(meta);
                                        setShowContributeModal(true);
                                    }}
                                >
                                    <FiTrendingUp size={14} />
                                    Contribuir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva Meta</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" className="input" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input type="text" className="input" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Monto Objetivo</label>
                                <input type="number" step="0.01" className="input" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Fecha Límite</label>
                                <input type="date" className="input" value={formData.fecha_limite} onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showContributeModal && (
                <div className="modal-overlay" onClick={() => setShowContributeModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Contribuir a {selectedMeta?.nombre}</h2>
                        <form onSubmit={handleContribute}>
                            <div className="form-group">
                                <label>Cantidad</label>
                                <input type="number" step="0.01" className="input" value={contribucion} onChange={(e) => setContribucion(e.target.value)} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowContributeModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-success">Contribuir</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;
