import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type mysql2 from 'mysql2';
import pool from '../db/pool';
import { env } from '../config/env';
import type { RegisterRequest, LoginRequest, User, JWTPayload } from './auth.types';
import { CustomError } from '../middleware/errorHandler';

const PASSWORD_MIN_LENGTH = 8;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

export class AuthService {
  async register(data: RegisterRequest): Promise<User> {
    const { email, username, password } = data;

    // Validate password length
    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new CustomError(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        400
      );
    }

    try {
      // Check if email already exists
      const [existingUsers] = await pool.execute<mysql2.RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new CustomError('Email already exists', 409);
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const [result] = await pool.execute<mysql2.ResultSetHeader>(
        'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
        [email, username || null, passwordHash]
      );

      // Fetch created user
      const [users] = await pool.execute<mysql2.RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );

      if (users.length === 0) {
        throw new CustomError('Failed to create user', 500);
      }

      const userRow = users[0];
      if (!userRow) {
        throw new CustomError('Failed to create user', 500);
      }

      // Map to User type with defaults for missing columns
      return {
        id: userRow.id,
        email: userRow.email,
        username: userRow.username,
        password_hash: userRow.password_hash,
        role: (userRow.role as 'user' | 'admin') || 'user',
        is_active: userRow.is_active ?? 1,
        created_at: userRow.created_at,
        updated_at: userRow.updated_at,
      } as User;
    } catch (error) {
      // Re-throw CustomError as-is
      if (error instanceof CustomError) {
        throw error;
      }

      // Log database errors with more detail
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Database error during registration:', {
        message: errorMessage,
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        sqlState: (error as any)?.sqlState,
        sqlMessage: (error as any)?.sqlMessage,
      });

      // Provide helpful error messages for common database issues
      if ((error as any)?.code === 'ER_NO_SUCH_TABLE') {
        throw new CustomError(
          'Database table does not exist. Please run the database migration.',
          500
        );
      }
      if ((error as any)?.code === 'ECONNREFUSED' || (error as any)?.code === 'ENOTFOUND') {
        throw new CustomError('Cannot connect to database. Check your database credentials.', 500);
      }
      if ((error as any)?.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new CustomError('Database access denied. Check your database credentials.', 500);
      }

      // Generic database error
      throw new CustomError(`Database error: ${errorMessage}`, 500);
    }
  }

  async login(
    data: LoginRequest,
    userAgent: string | undefined,
    ipAddress: string | undefined
  ): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;

    // Find user by email
    const [users] = await pool.execute<mysql2.RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Generic error message to avoid revealing if email exists
    const invalidCredentialsError = new CustomError('Invalid credentials', 401);

    if (users.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Login attempt: User not found for email:', email);
      }
      throw invalidCredentialsError;
    }

    const userRow = users[0];
    if (!userRow) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Login attempt: User row is null for email:', email);
      }
      throw invalidCredentialsError;
    }

    // Verify password
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Verifying password for user:', userRow.id, userRow.email);
    }

    const isValidPassword = await bcrypt.compare(password, userRow.password_hash);

    if (!isValidPassword) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Login attempt: Invalid password for email:', email);
      }
      throw invalidCredentialsError;
    }

    // Map user row to User type (default role to 'user' since column doesn't exist in DB)
    const user: User = {
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      password_hash: userRow.password_hash,
      role: (userRow.role as 'user' | 'admin') || 'user',
      is_active: userRow.is_active ?? 1,
      created_at: userRow.created_at,
      updated_at: userRow.updated_at,
    };

    // Generate tokens
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(jwtPayload, env.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user.id, type: 'refresh' }, env.jwtSecret, {
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });

    // Hash refresh token for storage
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Create session
    await pool.execute(
      'INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.id, refreshTokenHash, userAgent || null, ipAddress || null, expiresAt]
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    // Find all sessions for this token (we need to check all since we only have the hash)
    // This is a limitation - we'd need to store a token identifier to make this efficient
    // For now, we'll mark all non-revoked sessions for the user as revoked
    // In production, you might want to store a token ID alongside the hash

    try {
      const decoded = jwt.verify(refreshToken, env.jwtSecret) as { userId: number; type?: string };

      if (decoded.type !== 'refresh') {
        return;
      }

      // Revoke all active sessions for this user (simplified approach)
      // In a more sophisticated system, you'd match the exact token hash
      await pool.execute(
        'UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
        [decoded.userId]
      );
    } catch (error) {
      // Invalid token, ignore
      return;
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    const [users] = await pool.execute<mysql2.RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [
      userId,
    ]);

    if (users.length === 0) {
      return null;
    }

    const userRow = users[0];
    if (!userRow) {
      return null;
    }

    // Map to User type with defaults for missing columns
    return {
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      password_hash: userRow.password_hash,
      role: (userRow.role as 'user' | 'admin') || 'user',
      is_active: userRow.is_active ?? 1,
      created_at: userRow.created_at,
      updated_at: userRow.updated_at,
    } as User;
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new CustomError('Invalid or expired token', 401);
    }
  }
}

export const authService = new AuthService();
