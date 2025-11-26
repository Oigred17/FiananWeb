/**
 * Utilidades de validación para formularios
 */

/**
 * Validar campo de texto
 */
export const validateUsername = (username) => {
    if (!username || !username.trim()) {
        return { valid: false, error: 'El usuario es requerido' };
    }
    if (username.trim().length < 3) {
        return { valid: false, error: 'El usuario debe tener al menos 3 caracteres' };
    }
    if (username.trim().length > 50) {
        return { valid: false, error: 'El usuario no puede exceder 50 caracteres' };
    }
    return { valid: true };
};

/**
 * Validar contraseña
 */
export const validatePassword = (password) => {
    if (!password) {
        return { valid: false, error: 'La contraseña es requerida' };
    }
    if (password.length < 6) {
        return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    if (password.length > 100) {
        return { valid: false, error: 'La contraseña no puede exceder 100 caracteres' };
    }
    return { valid: true };
};

/**
 * Validar email
 */
export const validateEmail = (email) => {
    if (!email || !email.trim()) {
        return { valid: false, error: 'El email es requerido' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'El email no es válido' };
    }
    return { valid: true };
};

/**
 * Validar monto
 */
export const validateAmount = (amount) => {
    if (!amount || amount === '') {
        return { valid: false, error: 'El monto es requerido' };
    }
    if (isNaN(amount) || Number(amount) <= 0) {
        return { valid: false, error: 'El monto debe ser mayor a 0' };
    }
    if (Number(amount) > 999999999) {
        return { valid: false, error: 'El monto es demasiado grande' };
    }
    return { valid: true };
};

/**
 * Validar descripción
 */
export const validateDescription = (description) => {
    if (!description || !description.trim()) {
        return { valid: false, error: 'La descripción es requerida' };
    }
    if (description.trim().length < 3) {
        return { valid: false, error: 'La descripción debe tener al menos 3 caracteres' };
    }
    if (description.trim().length > 255) {
        return { valid: false, error: 'La descripción no puede exceder 255 caracteres' };
    }
    return { valid: true };
};

/**
 * Validar categoría
 */
export const validateCategory = (categoryId) => {
    if (!categoryId) {
        return { valid: false, error: 'La categoría es requerida' };
    }
    return { valid: true };
};

/**
 * Validar método de pago
 */
export const validatePaymentMethod = (method) => {
    if (!method || !method.trim()) {
        return { valid: false, error: 'El método de pago es requerido' };
    }
    const validMethods = ['efectivo', 'tarjeta', 'transferencia', 'cheque'];
    if (!validMethods.includes(method.toLowerCase())) {
        return { valid: false, error: 'Método de pago no válido' };
    }
    return { valid: true };
};

/**
 * Validar formulario de transacción
 */
export const validateTransaction = (data) => {
    const errors = {};
    
    // Validar categoría
    const categoryValidation = validateCategory(data.categoriaId);
    if (!categoryValidation.valid) {
        errors.categoriaId = categoryValidation.error;
    }
    
    // Validar monto
    const amountValidation = validateAmount(data.monto?.cantidad);
    if (!amountValidation.valid) {
        errors.monto = amountValidation.error;
    }
    
    // Validar descripción
    const descriptionValidation = validateDescription(data.detalle);
    if (!descriptionValidation.valid) {
        errors.detalle = descriptionValidation.error;
    }
    
    // Validar método de pago
    const methodValidation = validatePaymentMethod(data.metodo_pago);
    if (!methodValidation.valid) {
        errors.metodo_pago = methodValidation.error;
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validar formulario de presupuesto
 */
export const validateBudget = (data) => {
    const errors = {};
    
    // Validar categoría
    const categoryValidation = validateCategory(data.categoriaId);
    if (!categoryValidation.valid) {
        errors.categoriaId = categoryValidation.error;
    }
    
    // Validar monto máximo
    const amountValidation = validateAmount(data.monto_max?.cantidad);
    if (!amountValidation.valid) {
        errors.monto_max = amountValidation.error;
    }
    
    // Validar período
    if (!data.periodo || !['mensual', 'semanal', 'anual'].includes(data.periodo)) {
        errors.periodo = 'El período debe ser mensual, semanal o anual';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validar formulario de registro
 */
export const validateRegister = (data) => {
    const errors = {};
    
    // Validar username
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.valid) {
        errors.username = usernameValidation.error;
    }
    
    // Validar email
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
        errors.email = emailValidation.error;
    }
    
    // Validar contraseña
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
        errors.password = passwordValidation.error;
    }
    
    // Validar confirmación de contraseña
    if (data.password !== data.passwordConfirm) {
        errors.passwordConfirm = 'Las contraseñas no coinciden';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
};
