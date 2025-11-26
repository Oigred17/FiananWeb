import { useState, useEffect } from 'react';
import { movimientosService, categoriasService } from '../services/api';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './Transactions.css';

const Transactions = () => {
    const [gastos, setGastos] = useState([]);
    const [ingresos, setIngresos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tipo, setTipo] = useState('gasto');
    const [formData, setFormData] = useState({
        categoriaId: '',
        cantidad: '',
        metodo_pago: 'Efectivo',
        descripcion: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [gastosRes, ingresosRes, categoriasRes] = await Promise.all([
                movimientosService.getGastos({ limit: 50 }),
                movimientosService.getIngresos({ limit: 50 }),
                categoriasService.getAll()
            ]);
            setGastos(gastosRes.data);
            setIngresos(ingresosRes.data);
            setCategorias(categoriasRes.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                categoriaId: parseInt(formData.categoriaId),
                monto: { cantidad: parseFloat(formData.cantidad), moneda: 'MXN' },
                metodo_pago: formData.metodo_pago,
                descripcion: formData.descripcion
            };

            if (tipo === 'gasto') {
                data.detalle = formData.descripcion || 'Gasto';
                await movimientosService.createGasto(data);
            } else {
                data.fuente = formData.descripcion || 'Ingreso';
                await movimientosService.createIngreso(data);
            }

            setShowModal(false);
            setFormData({ categoriaId: '', cantidad: '', metodo_pago: 'Efectivo', descripcion: '' });
            loadData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id, tipoMov) => {
        if (!confirm('¿Eliminar esta transacción?')) return;
        try {
            if (tipoMov === 'gasto') {
                await movimientosService.deleteGasto(id);
            } else {
                await movimientosService.deleteIngreso(id);
            }
            loadData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('es-MX');
    };

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h1>Transacciones</h1>
                    <p>Gestiona tus ingresos y gastos</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus size={18} />
                    Nueva Transacción
                </button>
            </div>

            <div className="transactions-grid">
                <div className="transactions-section glass-card">
                    <h3>Gastos</h3>
                    <div className="transactions-list">
                        {gastos.map((gasto) => (
                            <div key={gasto.id} className="transaction-row">
                                <div>
                                    <p className="transaction-title">{gasto.detalle}</p>
                                    <span className="transaction-meta">{gasto.categoria_nombre} • {formatDate(gasto.fecha)}</span>
                                </div>
                                <div className="transaction-actions">
                                    <span className="amount expense">{formatCurrency(gasto.monto.cantidad)}</span>
                                    <button className="btn-icon" onClick={() => handleDelete(gasto.id, 'gasto')}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="transactions-section glass-card">
                    <h3>Ingresos</h3>
                    <div className="transactions-list">
                        {ingresos.map((ingreso) => (
                            <div key={ingreso.id} className="transaction-row">
                                <div>
                                    <p className="transaction-title">{ingreso.fuente}</p>
                                    <span className="transaction-meta">{ingreso.categoria_nombre} • {formatDate(ingreso.fecha)}</span>
                                </div>
                                <div className="transaction-actions">
                                    <span className="amount income">{formatCurrency(ingreso.monto.cantidad)}</span>
                                    <button className="btn-icon" onClick={() => handleDelete(ingreso.id, 'ingreso')}>
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva Transacción</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                    <option value="gasto">Gasto</option>
                                    <option value="ingreso">Ingreso</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Categoría</label>
                                <select className="input" value={formData.categoriaId} onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })} required>
                                    <option value="">Selecciona...</option>
                                    {categorias.filter(c => c.tipo === tipo).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cantidad</label>
                                <input type="number" step="0.01" className="input" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Método de Pago</label>
                                <input type="text" className="input" value={formData.metodo_pago} onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input type="text" className="input" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
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

export default Transactions;
