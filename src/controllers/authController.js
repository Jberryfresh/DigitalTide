/**
 * Authentication Controller
 * Handles user registration, login, token refresh, and logout
 */

import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { insert, query, findById } from '../database/queries.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../utils/jwt.js';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new ApiError(409, 'Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await insert('users', {
    email,
    password_hash: passwordHash,
    first_name: firstName || null,
    last_name: lastName || null,
    role: 'user',
    is_active: true,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await storeRefreshToken(user.id, refreshToken);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if account is active
  if (!user.is_active) {
    throw new ApiError(401, 'Account is deactivated');
  }

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new ApiError(401, 'Account is temporarily locked. Please try again later.');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    // Increment failed login attempts
    await query(
      `UPDATE users 
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE 
             WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
             ELSE NULL
           END
       WHERE id = $1`,
      [user.id]
    );

    throw new ApiError(401, 'Invalid email or password');
  }

  // Reset failed login attempts and update last login
  await query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  await storeRefreshToken(user.id, refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  // Verify refresh token
  const decoded = await verifyRefreshToken(refreshToken);

  // Get user
  const user = await findById('users', decoded.userId);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'User not found or inactive');
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  // Revoke old refresh token
  await revokeRefreshToken(refreshToken);

  // Store new refresh token
  await storeRefreshToken(user.id, newRefreshToken);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Logout from all devices
 * POST /api/v1/auth/logout-all
 */
export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllUserTokens(req.user.id);

  res.json({
    success: true,
    message: 'Logged out from all devices',
  });
});

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await findById('users', req.user.id);

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      emailVerified: user.email_verified,
      preferences: user.preferences,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    },
  });
});

export default {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
};
