import { Sequelize } from 'sequelize';
import User from './user.js';
import Session from './session.js';

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'security_web',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Define relationships
Session.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Session, { foreignKey: 'userId', as: 'Sessions' });

export { sequelize, User, Session };
export default sequelize;