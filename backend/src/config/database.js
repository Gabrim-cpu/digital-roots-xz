import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || 'xz_user',
  password: process.env.DB_PASSWORD || 'xz_password_123',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'xz_database',
};

export const pool = new Pool(dbConfig);

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log(`✅ PostgreSQL connected (${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database})`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL error:', error.message);
    console.error('   Tip: start Docker Desktop, then run setup.bat or npm run db:reset from backend/');
    console.error('   Stale Docker volume? npm run db:reset recreates PostgreSQL with the correct password.');
    return false;
  }
};
