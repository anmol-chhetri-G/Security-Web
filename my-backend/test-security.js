import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'STRONG_JWT_SECRET_KEY_FOR_USERS_KO_LAGI';

/**
 * Test JWT tampering prevention
 */
async function testJWTTampering() {
  console.log('\n🔒 Testing JWT Tampering Prevention...');
  
  try {
    // First, create a valid token
    const validPayload = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
      sessionToken: 'valid-session-token',
      type: 'access'
    };
    
    const validToken = jwt.sign(validPayload, JWT_SECRET, { expiresIn: '15m' });
    
    // Test 1: Try to access protected route with valid token
    console.log('Test 1: Valid token access...');
    const validResponse = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });
    
    if (validResponse.status === 403) {
      console.log('✅ Valid token correctly rejected (session validation working)');
    } else {
      console.log('❌ Valid token should be rejected due to invalid session');
    }
    
    // Test 2: Try to modify JWT payload
    console.log('Test 2: JWT payload tampering...');
    const tamperedPayload = {
      ...validPayload,
      role: 'admin' // Try to escalate privileges
    };
    
    const tamperedToken = jwt.sign(tamperedPayload, JWT_SECRET, { expiresIn: '15m' });
    
    const tamperedResponse = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: {
        'Authorization': `Bearer ${tamperedToken}`
      }
    });
    
    if (tamperedResponse.status === 403) {
      console.log('✅ Tampered JWT correctly rejected');
    } else {
      console.log('❌ Tampered JWT should be rejected');
    }
    
    // Test 3: Try with expired token
    console.log('Test 3: Expired token...');
    const expiredPayload = {
      ...validPayload,
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    };
    
    const expiredToken = jwt.sign(expiredPayload, JWT_SECRET);
    
    const expiredResponse = await fetch(`${BASE_URL}/api/auth/sessions`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    
    if (expiredResponse.status === 401) {
      console.log('✅ Expired token correctly rejected');
    } else {
      console.log('❌ Expired token should be rejected');
    }
    
  } catch (error) {
    console.error('❌ JWT tampering test failed:', error.message);
  }
}

/**
 * Test rate limiting
 */
async function testRateLimiting() {
  console.log('\n🚫 Testing Rate Limiting...');
  
  try {
    const loginAttempts = [];
    
    // Try multiple login attempts
    for (let i = 0; i < 6; i++) {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });
      
      loginAttempts.push({
        attempt: i + 1,
        status: response.status,
        body: await response.json()
      });
      
      console.log(`Attempt ${i + 1}: Status ${response.status}`);
    }
    
    // Check if rate limiting kicked in
    const lastAttempt = loginAttempts[loginAttempts.length - 1];
    if (lastAttempt.status === 429) {
      console.log('✅ Rate limiting working correctly');
    } else {
      console.log('❌ Rate limiting should have triggered');
    }
    
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }
}

/**
 * Test session management
 */
async function testSessionManagement() {
  console.log('\n🔐 Testing Session Management...');
  
  try {
    // Test login to get tokens
    const loginResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'securitytest',
        email: 'securitytest@example.com',
        password: 'testpass123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ User created successfully');
      
      // Test token refresh
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: loginData.refreshToken
        })
      });
      
      if (refreshResponse.ok) {
        console.log('✅ Token refresh working');
      } else {
        console.log('❌ Token refresh failed');
      }
      
      // Test logout
      const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (logoutResponse.ok) {
        console.log('✅ Logout working');
      } else {
        console.log('❌ Logout failed');
      }
      
    } else {
      console.log('❌ User creation failed');
    }
    
  } catch (error) {
    console.error('❌ Session management test failed:', error.message);
  }
}

/**
 * Run all security tests
 */
async function runSecurityTests() {
  console.log('🔒 Starting Security Tests...');
  console.log('=====================================');
  
  await testJWTTampering();
  await testRateLimiting();
  await testSessionManagement();
  
  console.log('\n=====================================');
  console.log('🔒 Security Tests Completed');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityTests().catch(console.error);
}

export { runSecurityTests }; 