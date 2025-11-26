import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar formularios con validación
 */
export const useForm = (initialValues, onSubmit, validators = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validateField = useCallback((name, value) => {
        if (validators[name]) {
            const validation = validators[name](value);
            return validation.valid ? null : validation.error;
        }
        return null;
    }, [validators]);

    const validateAll = useCallback(() => {
        const newErrors = {};
        
        Object.keys(values).forEach(name => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [values, validateField]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setValues(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Validar el campo si ya fue tocado
        if (touched[name]) {
            const error = validateField(name, newValue);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    }, [touched, validateField]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, [validateField]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setGeneralError('');
        setSuccessMessage('');

        if (!validateAll()) {
            setGeneralError('Por favor corrige los errores en el formulario');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await onSubmit(values);
            
            if (result.success) {
                setSuccessMessage(result.message || 'Operación completada exitosamente');
                setValues(initialValues);
                setTouched({});
                setErrors({});
            } else {
                setGeneralError(result.error || 'Error en la operación');
            }
        } catch (error) {
            setGeneralError(error.message || 'Error al procesar el formulario');
        } finally {
            setIsSubmitting(false);
        }
    }, [values, onSubmit, validateAll, initialValues]);

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setGeneralError('');
        setSuccessMessage('');
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        generalError,
        successMessage,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldError,
        resetForm,
        validateField,
        validateAll
    };
};

export default useForm;
