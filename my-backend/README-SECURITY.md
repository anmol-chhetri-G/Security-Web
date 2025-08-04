# Security Implementation Guide

## Overview

This backend now includes comprehensive security measures to prevent JWT tampering and ensure robust user session management. The implementation provides protection against common security vulnerabilities while maintaining a smooth user experience.

## Key Security Features

### 🔒 JWT Tampering Prevention
- **Server-side session validation**: Every JWT request is validated against the database
- **Session binding**: JWT tokens are bound to specific database sessions
- **Immediate invalidation**: Sessions can be invalidated instantly from the server
- **Data consistency checks**: JWT payload must match session data exactly

### 🚫 Rate Limiting & Account Protection
- **Login rate limiting**: 5 attempts per 15 minutes per email
- **Account lockout**: 15-minute lockout after 5 failed attempts
- **IP-based tracking**: Monitor and limit requests by IP address
- **Progressive delays**: Increasing delays between failed attempts

### 🔐 Secure Session Management
- **Short-lived access tokens**: 15-minute expiration
- **Refresh token rotation**: New refresh tokens on each use
- **Multi-device support**: Track sessions across different devices
- **Automatic cleanup**: Expired sessions are automatically removed

### 🛡️ Enhanced Authentication
- **Multi-layer validation**: JWT signature, format, session, and data validation
- **Role-based access control**: Granular permission system
- **Secure token generation**: Cryptographically secure random tokens
- **Comprehensive error handling**: Secure error responses

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Run the migration to create the session management tables:

```bash
# MySQL
mysql -u your_username -p your_database < migrations/001_add_session_management.sql

# Or use the migration script
npm run migrate
```

### 3. Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DB_NAME=security_web
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
REFRESH_SECRET=your-super-secure-refresh-secret-key-here

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account with secure session management.

**Request:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  },
  "expiresAt": "2024-01-01T12:15:00.000Z",
  "message": "Account created successfully"
}
```

#### POST `/api/auth/login`
Authenticate user with rate limiting and account protection.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  },
  "expiresAt": "2024-01-01T12:15:00.000Z",
  "message": "Login successful"
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-01-01T12:15:00.000Z"
}
```

#### POST `/api/auth/logout`
Invalidate current session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST `/api/auth/logout-all`
Invalidate all sessions for the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

#### GET `/api/auth/sessions`
Get user's active sessions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "deviceInfo": {
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-01-01T12:00:00.000Z"
      },
      "lastActivity": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T11:45:00.000Z"
    }
  ],
  "count": 1
}
```

## Frontend Integration

### Using the AuthContext

The frontend includes an updated `AuthContext` that handles the new security features:

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { 
    user, 
    login, 
    logout, 
    logoutAllDevices, 
    apiRequest, 
    isAuthenticated 
  } = useAuth();

  // Make authenticated API requests
  const fetchData = async () => {
    try {
      const response = await apiRequest('/api/protected-route');
      const data = await response.json();
      // Handle data
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
          <button onClick={logoutAllDevices}>Logout All Devices</button>
        </div>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

### Session Management Component

Use the `SessionManager` component to display and manage active sessions:

```jsx
import SessionManager from '../components/common/SessionManager';

function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <SessionManager />
    </div>
  );
}
```

## Security Testing

Run the security tests to verify the implementation:

```bash
node test-security.js
```

This will test:
- JWT tampering prevention
- Rate limiting functionality
- Session management
- Token refresh mechanism

## Security Best Practices

### For Developers
1. **Never store sensitive data in JWT payload**
2. **Always validate sessions server-side**
3. **Use HTTPS in production**
4. **Implement proper error handling**
5. **Regular security audits**

### For Deployment
1. **Use strong, unique secrets**
2. **Enable HTTPS/TLS**
3. **Configure proper CORS origins**
4. **Set up monitoring and alerting**
5. **Regular security updates**

## Monitoring & Logging

The system logs various security events:
- Failed login attempts
- Account lockouts
- Session invalidations
- Rate limit violations
- Suspicious activity patterns

Monitor these events to detect potential security issues.

## Troubleshooting

### Common Issues

1. **Session validation errors**
   - Check database connection
   - Verify session table exists
   - Check JWT secret configuration

2. **Rate limiting issues**
   - Verify rate limiter configuration
   - Check IP address detection
   - Monitor rate limit store cleanup

3. **Token refresh failures**
   - Check refresh token validity
   - Verify refresh secret configuration
   - Monitor session expiration

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed logs for troubleshooting.

## Support

For security-related issues or questions, please refer to the `SECURITY.md` file for detailed technical documentation. 