/**
 * JWT Token Utilities
 * Generate and verify JWT tokens
 */

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';
import { insert, query } from '../database/index.js';

/**
 * Generate access token
 */
export function generateAccessToken(userId) {
  return jwt.sign({ userId, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh', jti: uuidv4() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
}

/**
 * Store refresh token in database
 */
export async function storeRefreshToken(userId, token) {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await insert('refresh_tokens', {
    user_id: userId,
    token,
    expires_at: expiresAt,
  });
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token) {
  try {
    // Verify JWT signature
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    // Check if token exists in database and is not revoked
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Token not found or expired');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token) {
  await query('UPDATE refresh_tokens SET is_revoked = true WHERE token = $1', [token]);
}

/**
 * Revoke all user's refresh tokens
 */
export async function revokeAllUserTokens(userId) {
  await query('UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1', [userId]);
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens() {
  await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
}

export default {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
};
