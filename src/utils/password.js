/**
 * Password Utilities
 * Hash and verify passwords using bcrypt
 */

import bcrypt from 'bcryptjs';
import config from '../config/index.js';

/**
 * Hash password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(config.security.bcryptRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    score: 0,
  };

  // Calculate strength score
  if (strength.length) strength.score += 25;
  if (strength.hasUpperCase) strength.score += 25;
  if (strength.hasLowerCase) strength.score += 25;
  if (strength.hasNumbers) strength.score += 25;
  if (strength.hasSpecialChar) strength.score += 25;

  return strength;
}

export default {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
};
