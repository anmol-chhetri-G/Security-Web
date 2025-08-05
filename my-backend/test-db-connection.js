import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'security_web_db'
};

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📋 Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });
  
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('✅ Database connection successful!');

    // Test query to check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Tables found:', tables.map(row => Object.values(row)[0]));

    // Test query to check if users exist
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM Users');
    console.log('👥 Users count:', users[0].count);

    await connection.end();
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection(); 