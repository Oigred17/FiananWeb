/**
 * Ejemplo de implementación de validaciones en un formulario
 * Este archivo muestra cómo usar los componentes de validación
 */

import React, { useState } from 'react';
import { FormField, FormSelect, FormTextArea } from '../components/FormField';
import FormAlert, { ValidationErrors } from '../components/FormAlert';
import { useForm } from '../hooks/useForm';
import { validateTransaction } from '../utils/validators';
import { movimientosService } from '../services/api';

// Validadores para el formulario
const transactionValidators = {
    categoriaId: (value) => {
        if (!value) {
            return { valid: false, error: 'La categoría es requerida' };
        }
        return { valid: true };
    },
    'monto.cantidad': (value) => {
        if (!value || value === '') {
            return { valid: false, error: 'El monto es requerido' };
        }
        if (isNaN(value) || Number(value) <= 0) {
            return { valid: false, error: 'El monto debe ser mayor a 0' };
        }
        return { valid: true };
    },
    detalle: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, error: 'La descripción es requerida' };
        }
        if (value.trim().length < 3) {
            return { valid: false, error: 'La descripción debe tener al menos 3 caracteres' };
        }
        return { valid: true };
    },
    metodo_pago: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, error: 'El método de pago es requerido' };
        }
        return { valid: true };
    }
};

const TransactionFormExample = () => {
    const [categories, setCategories] = useState([]);

    const form = useForm(
        {
            categoriaId: '',
            'monto.cantidad': '',
            detalle: '',
            metodo_pago: '',
            descripcion: ''
        },
        async (values) => {
            try {
                // Validar antes de enviar
                const validation = validateTransaction({
                    categoriaId: values.categoriaId,
                    monto: { cantidad: values['monto.cantidad'], moneda: 'MXN' },
                    detalle: values.detalle,
                    metodo_pago: values.metodo_pago
                });

                if (!validation.valid) {
                    return {
                        success: false,
                        error: 'Por favor corrige los errores en el formulario'
                    };
                }

                // Hacer la petición a la API
                const response = await movimientosService.createGasto({
                    categoriaId: parseInt(values.categoriaId),
                    monto: {
                        cantidad: parseFloat(values['monto.cantidad']),
                        moneda: 'MXN'
                    },
                    detalle: values.detalle,
                    metodo_pago: values.metodo_pago,
                    descripcion: values.descripcion
                });

                return {
                    success: true,
                    message: 'Gasto creado exitosamente'
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message || 'Error al crear el gasto'
                };
            }
        },
        transactionValidators
    );

    return (
        <form onSubmit={form.handleSubmit}>
            {form.generalError && (
                <FormAlert
                    type="error"
                    title="Error"
                    message={form.generalError}
                    onClose={() => form.setFieldError('general', '')}
                />
            )}

            {form.successMessage && (
                <FormAlert
                    type="success"
                    title="Éxito"
                    message={form.successMessage}
                />
            )}

            {Object.keys(form.errors).length > 0 && (
                <ValidationErrors
                    errors={form.errors}
                    onClose={() => {}}
                />
            )}

            <FormSelect
                label="Categoría"
                name="categoriaId"
                value={form.values.categoriaId}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.errors.categoriaId}
                options={categories.map(cat => ({
                    value: cat.id,
                    label: cat.nombre
                }))}
                required
            />

            <FormField
                label="Monto"
                type="number"
                name="monto.cantidad"
                value={form.values['monto.cantidad']}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.errors['monto.cantidad']}
                placeholder="0.00"
                step="0.01"
                required
            />

            <FormField
                label="Descripción"
                type="text"
                name="detalle"
                value={form.values.detalle}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.errors.detalle}
                placeholder="Ej: Compra en el supermercado"
                maxLength={255}
                required
            />

            <FormSelect
                label="Método de pago"
                name="metodo_pago"
                value={form.values.metodo_pago}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                error={form.errors.metodo_pago}
                options={[
                    { value: 'efectivo', label: 'Efectivo' },
                    { value: 'tarjeta', label: 'Tarjeta de Crédito' },
                    { value: 'transferencia', label: 'Transferencia Bancaria' },
                    { value: 'cheque', label: 'Cheque' }
                ]}
                required
            />

            <FormTextArea
                label="Notas (opcional)"
                name="descripcion"
                value={form.values.descripcion}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                placeholder="Agrega notas adicionales sobre este gasto"
                maxLength={500}
            />

            <button
                type="submit"
                className="btn btn-primary"
                disabled={form.isSubmitting}
            >
                {form.isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
            </button>
        </form>
    );
};

export default TransactionFormExample;
