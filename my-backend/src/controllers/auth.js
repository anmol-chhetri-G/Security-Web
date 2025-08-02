import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

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
      lastLogin: new Date()
    });

    // Generate JWT token for immediate authentication
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      },
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
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Update last login timestamp
    await user.update({ lastLogin: new Date() });

    // Generate JWT token for authentication
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}