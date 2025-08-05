import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'security_web_db'
};

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  try {
    // First, connect without specifying database to create it
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);

    // Use the database
    await connection.execute(`USE ${dbConfig.database}`);

         // Create tables directly
     console.log('📊 Creating database tables...');
     
     // Create Users table
     await connection.query(`
       CREATE TABLE IF NOT EXISTS Users (
         id INT AUTO_INCREMENT PRIMARY KEY,
         username VARCHAR(255) NOT NULL UNIQUE,
         email VARCHAR(255) NOT NULL UNIQUE,
         password VARCHAR(255) NOT NULL,
         role ENUM('user', 'admin') DEFAULT 'user',
         isActive BOOLEAN DEFAULT TRUE,
         lastLogin TIMESTAMP NULL,
         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         INDEX idx_email (email),
         INDEX idx_username (username),
         INDEX idx_created_at (createdAt)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
     `);
     console.log('✅ Users table created/verified');

     // Create UserSessions table
     await connection.query(`
       CREATE TABLE IF NOT EXISTS UserSessions (
         id INT AUTO_INCREMENT PRIMARY KEY,
         userId INT NOT NULL,
         token VARCHAR(500) NOT NULL UNIQUE,
         expiresAt TIMESTAMP NOT NULL,
         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         lastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
         INDEX idx_token (token),
         INDEX idx_user_id (userId),
         INDEX idx_expires_at (expiresAt)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
     `);
     console.log('✅ UserSessions table created/verified');

     // Create ApiUsageLog table
     await connection.query(`
       CREATE TABLE IF NOT EXISTS ApiUsageLog (
         id INT AUTO_INCREMENT PRIMARY KEY,
         userId INT NULL,
         endpoint VARCHAR(100) NOT NULL,
         method VARCHAR(10) NOT NULL,
         ipAddress VARCHAR(45),
         userAgent TEXT,
         statusCode INT,
         responseTime INT,
         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE SET NULL,
         INDEX idx_user_id (userId),
         INDEX idx_endpoint (endpoint),
         INDEX idx_created_at (createdAt)
       ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
     `);
     console.log('✅ ApiUsageLog table created/verified');

     // Insert sample admin user if not exists
     try {
       await connection.query(`
         INSERT IGNORE INTO Users (username, email, password, role, createdAt) 
         VALUES ('admin', 'admin@securityweb.com', '$2b$10$rQZ8K9mN2pL1vX3yU7wE4t.6sA8bC5dF2gH3jK4lM5nO6pQ7rS8tU9vW0xY1z', 'admin', CURRENT_TIMESTAMP)
       `);
       console.log('✅ Sample admin user created/verified');
     } catch (error) {
       console.log('⚠️  Admin user already exists or error:', error.message);
     }

     // Insert sample regular user if not exists
     try {
       await connection.query(`
         INSERT IGNORE INTO Users (username, email, password, role, createdAt) 
         VALUES ('demo_user', 'demo@example.com', '$2b$10$mN2pL1vX3yU7wE4t.6sA8bC5dF2gH3jK4lM5nO6pQ7rS8tU9vW0xY1zA2b', 'user', CURRENT_TIMESTAMP)
       `);
       console.log('✅ Sample user created/verified');
     } catch (error) {
       console.log('⚠️  Demo user already exists or error:', error.message);
     }

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created: Users, UserSessions, ApiUsageLog');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check your .env file for correct database credentials');
    console.log('3. Try running: mysql -u root -p');
    console.log('4. If MySQL is not in PATH, try using MySQL Workbench');
  }
}

// Run the setup
setupDatabase(); 