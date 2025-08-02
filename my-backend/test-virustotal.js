import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

console.log('🔍 VirusTotal API Key Test');
console.log('==========================');

if (!API_KEY) {
  console.log('❌ VIRUSTOTAL_API_KEY not found in environment variables');
  process.exit(1);
}

console.log(`✅ API Key found (length: ${API_KEY.length})`);
console.log(`🔑 API Key starts with: ${API_KEY.substring(0, 10)}...`);

async function testApiKey() {
  try {
    // Test 1: Check API key with a simple request
    console.log('\n🧪 Test 1: Basic API key validation...');
    
    const testUrl = 'https://www.virustotal.com/vtapi/v2/file/report';
    const testParams = new URLSearchParams({
      apikey: API_KEY,
      resource: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // SHA256 of empty file
    });

    const response = await fetch(`${testUrl}?${testParams}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'SecurityWeb-Test/1.0'
      },
      timeout: 10000
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ API key is working correctly');
      console.log('📊 Response data:', data);
    } else if (response.status === 403) {
      console.log('❌ API key is invalid or has insufficient permissions');
      const errorText = await response.text();
      console.log('📄 Error details:', errorText);
    } else {
      console.log(`⚠️ Unexpected response: ${response.status}`);
      const errorText = await response.text();
      console.log('📄 Response body:', errorText);
    }

    // Test 2: Check rate limits
    console.log('\n🧪 Test 2: Rate limit check...');
    
    const rateLimitResponse = await fetch('https://www.virustotal.com/vtapi/v2/file/scan', {
      method: 'POST',
      headers: {
        'x-apikey': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'resource=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timeout: 10000
    });

    console.log(`📡 Upload test status: ${rateLimitResponse.status} ${rateLimitResponse.statusText}`);
    
    if (rateLimitResponse.status === 403) {
      const errorText = await rateLimitResponse.text();
      console.log('❌ Upload permission denied or rate limited');
      console.log('📄 Error details:', errorText);
    } else if (rateLimitResponse.status === 200) {
      console.log('✅ Upload permissions are available');
    } else {
      console.log(`⚠️ Unexpected upload response: ${rateLimitResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApiKey(); 