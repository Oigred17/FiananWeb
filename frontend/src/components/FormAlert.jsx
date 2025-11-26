import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import './FormAlert.css';

/**
 * Componente para mostrar alertas de validación
 */
const FormAlert = ({ 
    type = 'error',  // 'error', 'success', 'warning', 'info'
    message,
    title,
    onClose,
    className = ''
}) => {
    if (!message) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <FiAlertCircle size={20} />;
            case 'success':
                return <FiCheckCircle size={20} />;
            case 'info':
                return <FiInfo size={20} />;
            case 'warning':
                return <FiAlertCircle size={20} />;
            default:
                return <FiInfo size={20} />;
        }
    };

    return (
        <div className={`form-alert form-alert-${type} ${className}`}>
            <div className="form-alert-icon">
                {getIcon()}
            </div>
            <div className="form-alert-content">
                {title && <p className="form-alert-title">{title}</p>}
                <p className="form-alert-message">{message}</p>
            </div>
            {onClose && (
                <button className="form-alert-close" onClick={onClose}>
                    <FiX size={18} />
                </button>
            )}
        </div>
    );
};

/**
 * Componente para mostrar errores de campo
 */
export const FieldError = ({ error, className = '' }) => {
    if (!error) return null;

    return (
        <div className={`field-error ${className}`}>
            <FiAlertCircle size={14} />
            <span>{error}</span>
        </div>
    );
};

/**
 * Componente para mostrar múltiples errores de validación
 */
export const ValidationErrors = ({ errors, onClose }) => {
    if (!errors || Object.keys(errors).length === 0) return null;

    const errorList = Object.entries(errors).map(([field, error]) => (
        <li key={field}>{error}</li>
    ));

    return (
        <FormAlert
            type="error"
            title="Errores de validación"
            message={
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                    {errorList}
                </ul>
            }
            onClose={onClose}
        />
    );
};

export default FormAlert;
