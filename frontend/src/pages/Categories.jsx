import { useState, useEffect } from 'react';
import { categoriasService } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../pages/Transactions.css';

const Categories = () => {
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', tipo: 'gasto', descripcion: '' });

    useEffect(() => {
        loadCategorias();
    }, []);

    const loadCategorias = async () => {
        try {
            const res = await categoriasService.getAll();
            setCategorias(res.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await categoriasService.create(formData);
            setShowModal(false);
            setFormData({ nombre: '', tipo: 'gasto', descripcion: '' });
            loadCategorias();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta categoría?')) return;
        try {
            await categoriasService.delete(id);
            loadCategorias();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al eliminar');
        }
    };

    const gastos = categorias.filter(c => c.tipo === 'gasto');
    const ingresos = categorias.filter(c => c.tipo === 'ingreso');

    return (
        <div className="transactions-page">
            <div className="page-header">
                <div>
                    <h1>Categorías</h1>
                    <p>Organiza tus transacciones</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <FiPlus size={18} />
                    Nueva Categoría
                </button>
            </div>

            <div className="transactions-grid">
                <div className="transactions-section glass-card">
                    <h3>Categorías de Gastos</h3>
                    <div className="transactions-list">
                        {gastos.map((cat) => (
                            <div key={cat.id} className="transaction-row">
                                <div>
                                    <p className="transaction-title">{cat.nombre}</p>
                                    <span className="transaction-meta">{cat.descripcion}</span>
                                </div>
                                <button className="btn-icon" onClick={() => handleDelete(cat.id)}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="transactions-section glass-card">
                    <h3>Categorías de Ingresos</h3>
                    <div className="transactions-list">
                        {ingresos.map((cat) => (
                            <div key={cat.id} className="transaction-row">
                                <div>
                                    <p className="transaction-title">{cat.nombre}</p>
                                    <span className="transaction-meta">{cat.descripcion}</span>
                                </div>
                                <button className="btn-icon" onClick={() => handleDelete(cat.id)}>
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                        <h2>Nueva Categoría</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input type="text" className="input" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select className="input" value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                                    <option value="gasto">Gasto</option>
                                    <option value="ingreso">Ingreso</option>
                                </select>
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

export default Categories;
