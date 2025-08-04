import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/session.js';
import User from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'STRONG_JWT_SECRET_KEY_FOR_USERS_KO_LAGI';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'REFRESH_SECRET_KEY_FOR_SESSION_MANAGEMENT';
const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes
const REFRESH_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a secure random token
 */
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId, ipAddress, userAgent, deviceInfo = {}) {
  try {
    const sessionToken = generateSecureToken();
    const refreshToken = generateSecureToken();
    
    const session = await Session.create({
      userId,
      sessionToken,
      refreshToken,
      ipAddress,
      userAgent,
      deviceInfo,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
      lastActivity: new Date()
    });

    // Update user's session token
    await User.update(
      { sessionToken },
      { where: { id: userId } }
    );

    return {
      sessionToken,
      refreshToken,
      expiresAt: session.expiresAt
    };
  } catch (error) {
    console.error('Session creation error:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Validate session token and return user data
 */
export async function validateSession(sessionToken) {
  try {
    const session = await Session.findOne({
      where: {
        sessionToken,
        isActive: true,
        expiresAt: { [Session.sequelize.Op.gt]: new Date() }
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'role', 'isActive']
      }]
    });

    if (!session || !session.User) {
      return null;
    }

    // Update last activity
    await session.update({ lastActivity: new Date() });

    return {
      userId: session.User.id,
      username: session.User.username,
      email: session.User.email,
      role: session.User.role,
      sessionId: session.id
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Refresh session token
 */
export async function refreshSession(refreshToken) {
  try {
    const session = await Session.findOne({
      where: {
        refreshToken,
        isActive: true,
        expiresAt: { [Session.sequelize.Op.gt]: new Date() }
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'role', 'isActive']
      }]
    });

    if (!session || !session.User) {
      return null;
    }

    // Generate new session token
    const newSessionToken = generateSecureToken();
    
    // Update session
    await session.update({
      sessionToken: newSessionToken,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
      lastActivity: new Date()
    });

    // Update user's session token
    await User.update(
      { sessionToken: newSessionToken },
      { where: { id: session.User.id } }
    );

    return {
      sessionToken: newSessionToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      user: {
        id: session.User.id,
        username: session.User.username,
        email: session.User.email,
        role: session.User.role
      }
    };
  } catch (error) {
    console.error('Session refresh error:', error);
    return null;
  }
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(sessionToken) {
  try {
    const session = await Session.findOne({
      where: { sessionToken }
    });

    if (session) {
      await session.update({ isActive: false });
      
      // Clear user's session token
      await User.update(
        { sessionToken: null },
        { where: { id: session.userId } }
      );
    }

    return true;
  } catch (error) {
    console.error('Session invalidation error:', error);
    return false;
  }
}

/**
 * Invalidate all sessions for a user (force logout from all devices)
 */
export async function invalidateAllUserSessions(userId) {
  try {
    await Session.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    await User.update(
      { sessionToken: null },
      { where: { id: userId } }
    );

    return true;
  } catch (error) {
    console.error('Invalidate all sessions error:', error);
    return false;
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  try {
    const result = await Session.update(
      { isActive: false },
      {
        where: {
          expiresAt: { [Session.sequelize.Op.lt]: new Date() },
          isActive: true
        }
      }
    );

    console.log(`Cleaned up ${result[0]} expired sessions`);
    return result[0];
  } catch (error) {
    console.error('Session cleanup error:', error);
    return 0;
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(userId) {
  try {
    const sessions = await Session.findAll({
      where: {
        userId,
        isActive: true,
        expiresAt: { [Session.sequelize.Op.gt]: new Date() }
      },
      attributes: ['id', 'ipAddress', 'userAgent', 'deviceInfo', 'lastActivity', 'createdAt'],
      order: [['lastActivity', 'DESC']]
    });

    return sessions;
  } catch (error) {
    console.error('Get user sessions error:', error);
    return [];
  }
}

/**
 * Generate JWT token with session validation
 */
export function generateJWT(userData, sessionToken) {
  return jwt.sign(
    {
      ...userData,
      sessionToken,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshJWT(refreshToken) {
  return jwt.sign(
    { token: refreshToken, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
} 