import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { createSession, generateJWT, generateRefreshJWT, invalidateSession, invalidateAllUserSessions, refreshSession, getUserActiveSessions } from '../utils/sessionManager.js';
import { checkLoginRateLimit, resetLoginRateLimit, checkAccountLockout, incrementFailedAttempts, resetFailedAttempts } from '../utils/rateLimiter.js';

// JWT secret for token generation and verification
const JWT_SECRET = process.env.JWT_SECRET || 'STRONG_JWT_SECRET_KEY_FOR_USERS_KO_LAGI';

/**
 * User registration endpoint
 * Creates new user account with encrypted password
 * Validates input data and checks for existing users
 */
export async function signup(req, res) {
  const { username, email, password } = req.body;
  
  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Username validation and sanitization
    if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters long' });
    }

    // Sanitize username - only allow alphanumeric, dots, underscores, hyphens
    const sanitizedUsername = username.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedUsername !== username) {
      return res.status(400).json({ error: 'Username contains invalid characters' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check database connection before proceeding
    try {
      await User.sequelize.authenticate();
    } catch (dbError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Please try again later or contact support'
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      username: sanitizedUsername, 
      email, 
      password: hashedPassword,
      lastLogin: new Date(),
      lastPasswordChange: new Date()
    });

    // Create secure session
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const deviceInfo = {
      ip: ipAddress,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    };

    const session = await createSession(user.id, ipAddress, userAgent, deviceInfo);
    
    // Generate JWT tokens
    const accessToken = generateJWT(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      session.sessionToken
    );
    const refreshToken = generateRefreshJWT(session.refreshToken);

    res.status(201).json({ 
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      },
      expiresAt: session.expiresAt,
      message: 'Account created successfully'
    });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
}

/**
 * User login endpoint
 * Authenticates user credentials and returns JWT token
 * Updates last login timestamp on successful authentication
 */
export async function login(req, res) {
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check rate limiting
    const rateLimitCheck = await checkLoginRateLimit(email);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: 'Too many login attempts',
        message: rateLimitCheck.message,
        remainingTime: rateLimitCheck.remainingTime
      });
    }

    // Check database connection before proceeding
    try {
      await User.sequelize.authenticate();
    } catch (dbError) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Please try again later or contact support'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      await incrementFailedAttempts(user?.id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Check account lockout
    const lockoutCheck = await checkAccountLockout(user.id);
    if (lockoutCheck.locked) {
      return res.status(423).json({ 
        error: 'Account temporarily locked',
        message: lockoutCheck.message,
        remainingTime: lockoutCheck.remainingTime
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await incrementFailedAttempts(user.id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await resetFailedAttempts(user.id);
    resetLoginRateLimit(email);

    // Update last login timestamp
    await user.update({ lastLogin: new Date() });

    // Create secure session
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const deviceInfo = {
      ip: ipAddress,
      userAgent: userAgent,
      timestamp: new Date().toISOString()
    };

    const session = await createSession(user.id, ipAddress, userAgent, deviceInfo);
    
    // Generate JWT tokens
    const accessToken = generateJWT(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      session.sessionToken
    );
    const refreshToken = generateRefreshJWT(session.refreshToken);

    res.json({ 
      accessToken,
      refreshToken,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      },
      expiresAt: session.expiresAt,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

/**
 * Refresh token endpoint
 * Generates new access token using refresh token
 */
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'REFRESH_SECRET_KEY_FOR_SESSION_MANAGEMENT');
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    // Refresh session
    const session = await refreshSession(decoded.token);
    if (!session) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateJWT(
      { id: session.user.id, email: session.user.email, username: session.user.username, role: session.user.role },
      session.sessionToken
    );

    res.json({
      accessToken,
      refreshToken,
      expiresAt: session.expiresAt
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
}

/**
 * Logout endpoint
 * Invalidates current session
 */
export async function logout(req, res) {
  try {
    const sessionToken = req.user?.sessionToken;
    
    if (sessionToken) {
      await invalidateSession(sessionToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
}

/**
 * Logout from all devices endpoint
 * Invalidates all sessions for the user
 */
export async function logoutAllDevices(req, res) {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      await invalidateAllUserSessions(userId);
    }

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error('Logout all devices error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
}

/**
 * Get user's active sessions
 */
export async function getUserSessions(req, res) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const sessions = await getUserActiveSessions(userId);
    
    res.json({ 
      sessions,
      count: sessions.length
    });
  } catch (err) {
    console.error('Get user sessions error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}