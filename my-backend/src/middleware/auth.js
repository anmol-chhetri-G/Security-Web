import jwt from 'jsonwebtoken';
import { validateSession } from '../utils/sessionManager.js';

// JWT authentication middleware for protecting routes
// Uses environment variable for JWT secret to ensure security
const JWT_SECRET = process.env.JWT_SECRET || 'STRONG_JWT_SECRET_KEY_FOR_USERS_KO_LAGI';

/**
 * Middleware to authenticate JWT tokens with session validation
 * Extracts token from Authorization header and verifies it
 * Validates session token against database to prevent tampering
 * Adds user data to request object if token is valid
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token has required fields
    if (!decoded.sessionToken || decoded.type !== 'access') {
      return res.status(403).json({ error: 'Invalid token format' });
    }

    // Validate session token against database
    const sessionData = await validateSession(decoded.sessionToken);
    if (!sessionData) {
      return res.status(403).json({ error: 'Session expired or invalid' });
    }

    // Verify user data matches session
    if (sessionData.userId !== decoded.id || 
        sessionData.email !== decoded.email || 
        sessionData.username !== decoded.username) {
      return res.status(403).json({ error: 'Token data mismatch' });
    }

    // Add validated user data to request object
    req.user = {
      id: sessionData.userId,
      email: sessionData.email,
      username: sessionData.username,
      role: sessionData.role,
      sessionToken: decoded.sessionToken,
      sessionId: sessionData.sessionId
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    } else {
      console.error('Authentication error:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
}

/**
 * Middleware to check if user has admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `${role} access required` });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided, but adds user data if valid token exists
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next(); // Continue without authentication
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.sessionToken || decoded.type !== 'access') {
      return next(); // Continue without authentication
    }

    const sessionData = await validateSession(decoded.sessionToken);
    if (sessionData && 
        sessionData.userId === decoded.id && 
        sessionData.email === decoded.email && 
        sessionData.username === decoded.username) {
      
      req.user = {
        id: sessionData.userId,
        email: sessionData.email,
        username: sessionData.username,
        role: sessionData.role,
        sessionToken: decoded.sessionToken,
        sessionId: sessionData.sessionId
      };
    }

    next();
  } catch (err) {
    // Continue without authentication on any error
    next();
  }
}