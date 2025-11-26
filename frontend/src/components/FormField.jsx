import React, { useState } from 'react';
import FormAlert, { FieldError, ValidationErrors } from './FormAlert';
import './FormField.css';

/**
 * Componente de campo de formulario con validación
 */
export const FormField = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    minLength,
    maxLength,
    pattern,
    helperText,
    className = ''
}) => {
    const [touched, setTouched] = useState(false);

    const handleBlur = () => {
        setTouched(true);
    };

    const hasError = error && touched;

    return (
        <div className={`form-field ${className}`}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                minLength={minLength}
                maxLength={maxLength}
                pattern={pattern}
                className={`form-input ${hasError ? 'form-input-error' : ''}`}
            />
            {hasError && <FieldError error={error} />}
            {helperText && !hasError && (
                <p className="form-helper-text">{helperText}</p>
            )}
        </div>
    );
};

/**
 * Componente de campo de selección
 */
export const FormSelect = ({
    label,
    name,
    value,
    onChange,
    error,
    options = [],
    required = false,
    disabled = false,
    placeholder = 'Selecciona una opción',
    className = ''
}) => {
    const [touched, setTouched] = useState(false);

    const handleBlur = () => {
        setTouched(true);
    };

    const hasError = error && touched;

    return (
        <div className={`form-field ${className}`}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                required={required}
                disabled={disabled}
                className={`form-select ${hasError ? 'form-select-error' : ''}`}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {hasError && <FieldError error={error} />}
        </div>
    );
};

/**
 * Componente de área de texto
 */
export const FormTextArea = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    rows = 4,
    maxLength,
    className = ''
}) => {
    const [touched, setTouched] = useState(false);

    const handleBlur = () => {
        setTouched(true);
    };

    const hasError = error && touched;

    return (
        <div className={`form-field ${className}`}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={`form-textarea ${hasError ? 'form-textarea-error' : ''}`}
            />
            <div className="form-textarea-footer">
                {maxLength && (
                    <span className="form-char-count">
                        {value.length}/{maxLength}
                    </span>
                )}
            </div>
            {hasError && <FieldError error={error} />}
        </div>
    );
};

/**
 * Componente de grupo de formulario
 */
export const FormGroup = ({ children, className = '' }) => {
    return (
        <div className={`form-group ${className}`}>
            {children}
        </div>
    );
};

export default FormField;
