import { Op } from 'sequelize';
import User from '../models/user.js';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Rate limiter for login attempts
 */
export async function checkLoginRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const key = `login:${identifier}`;
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 0, resetTime: now + windowMs });
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (now > record.resetTime) {
    record.attempts = 0;
    record.resetTime = now + windowMs;
  }
  
  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000);
    return {
      allowed: false,
      remainingTime,
      message: `Too many login attempts. Try again in ${remainingTime} seconds.`
    };
  }
  
  record.attempts++;
  return { allowed: true, remainingAttempts: maxAttempts - record.attempts };
}

/**
 * Reset rate limit for successful login
 */
export function resetLoginRateLimit(identifier) {
  const key = `login:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Check if user account is locked due to failed attempts
 */
export async function checkAccountLockout(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) return false;
    
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockoutUntil - new Date()) / 1000);
      return {
        locked: true,
        remainingTime,
        message: `Account temporarily locked. Try again in ${remainingTime} seconds.`
      };
    }
    
    return { locked: false };
  } catch (error) {
    console.error('Account lockout check error:', error);
    return { locked: false };
  }
}

/**
 * Increment failed login attempts and lock account if necessary
 */
export async function incrementFailedAttempts(userId, maxAttempts = 5, lockoutDuration = 15 * 60 * 1000) {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;
    
    const newAttempts = user.loginAttempts + 1;
    let lockoutUntil = null;
    
    if (newAttempts >= maxAttempts) {
      lockoutUntil = new Date(Date.now() + lockoutDuration);
    }
    
    await user.update({
      loginAttempts: newAttempts,
      lockoutUntil
    });
    
    return {
      attempts: newAttempts,
      locked: !!lockoutUntil,
      lockoutUntil
    };
  } catch (error) {
    console.error('Failed attempts increment error:', error);
  }
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedAttempts(userId) {
  try {
    await User.update(
      { loginAttempts: 0, lockoutUntil: null },
      { where: { id: userId } }
    );
  } catch (error) {
    console.error('Reset failed attempts error:', error);
  }
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up rate limit store every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000); 