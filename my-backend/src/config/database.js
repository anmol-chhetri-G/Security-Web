import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  database: process.env.DB_NAME || 'security_web_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
};

export default dbConfig;