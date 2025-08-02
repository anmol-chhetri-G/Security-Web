import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Environment Variables Check');
console.log('==============================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log(`📁 .env file exists: ${fs.existsSync(envPath)}`);

if (fs.existsSync(envPath)) {
  console.log(`📄 .env file size: ${fs.statSync(envPath).size} bytes`);
  console.log('📋 .env file contents:');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
}

// Load environment variables
dotenv.config();

console.log('\n🔧 Environment Variables After Loading:');
console.log('=====================================');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`VIRUSTOTAL_API_KEY exists: ${!!process.env.VIRUSTOTAL_API_KEY}`);
console.log(`VIRUSTOTAL_API_KEY length: ${process.env.VIRUSTOTAL_API_KEY?.length || 0}`);
console.log(`VIRUSTOTAL_API_KEY first 10 chars: ${process.env.VIRUSTOTAL_API_KEY?.substring(0, 10) || 'not set'}...`);

// Check all environment variables
console.log('\n📋 All Environment Variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('VIRUS') || key.includes('API') || key.includes('DB')) {
    const value = process.env[key];
    const displayValue = key.includes('KEY') || key.includes('PASSWORD') 
      ? `${value?.substring(0, 10)}...` 
      : value;
    console.log(`${key}: ${displayValue}`);
  }
});

console.log('\n✅ Check complete!'); 