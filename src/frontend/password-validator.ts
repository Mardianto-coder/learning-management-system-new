/**
 * Password Validator Helper
 * 
 * Validasi password di frontend sebelum submit
 */

/**
 * Validasi password sesuai requirement
 * - Minimal 6 karakter
 * - Minimal 1 uppercase letter
 * - Minimal 1 lowercase letter
 * - Minimal 1 number
 */
export function validatePasswordFormat(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
        return { valid: false, message: 'Password harus minimal 6 karakter' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung minimal 1 huruf kecil' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung minimal 1 huruf besar' };
    }
    
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Password harus mengandung minimal 1 angka' };
    }
    
    return { valid: true, message: '' };
}

/**
 * Update visual feedback untuk password input
 */
export function updatePasswordFeedback(input: HTMLInputElement, isValid: boolean, message: string): void {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing feedback
    const existingFeedback = formGroup.querySelector('.password-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Add new feedback
    const feedback = document.createElement('small');
    feedback.className = 'password-feedback';
    feedback.style.display = 'block';
    feedback.style.marginTop = '5px';
    feedback.style.fontSize = '0.85em';
    feedback.style.color = isValid ? '#28a745' : '#dc3545';
    feedback.textContent = message;
    
    formGroup.appendChild(feedback);
    
    // Update input border color
    if (isValid) {
        input.style.borderColor = '#28a745';
    } else {
        input.style.borderColor = '#dc3545';
    }
}

