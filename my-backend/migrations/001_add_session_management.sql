-- Migration: Add Session Management
-- Date: 2024-01-01
-- Description: Adds session management tables and fields to Users table

-- Add session management fields to Users table
ALTER TABLE Users 
ADD COLUMN sessionToken VARCHAR(255) UNIQUE,
ADD COLUMN sessionExpiry DATETIME,
ADD COLUMN loginAttempts INT DEFAULT 0,
ADD COLUMN lockoutUntil DATETIME,
ADD COLUMN lastPasswordChange DATETIME,
ADD COLUMN passwordResetToken VARCHAR(255),
ADD COLUMN passwordResetExpiry DATETIME;

-- Create Sessions table
CREATE TABLE Sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  sessionToken VARCHAR(255) UNIQUE NOT NULL,
  refreshToken VARCHAR(255) UNIQUE NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  expiresAt DATETIME NOT NULL,
  lastActivity DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deviceInfo JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_sessionToken (sessionToken),
  INDEX idx_refreshToken (refreshToken),
  INDEX idx_expiresAt (expiresAt),
  INDEX idx_isActive (isActive)
);

-- Add indexes for performance
CREATE INDEX idx_users_sessionToken ON Users(sessionToken);
CREATE INDEX idx_users_loginAttempts ON Users(loginAttempts);
CREATE INDEX idx_users_lockoutUntil ON Users(lockoutUntil);

-- Update existing users to have lastPasswordChange set
UPDATE Users SET lastPasswordChange = createdAt WHERE lastPasswordChange IS NULL; 