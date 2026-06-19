import { pool } from '../config/database.js';

const setupDatabase = async () => {
  console.log('🔧 Setting up database tables...');
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid VARCHAR(128) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        identity VARCHAR(10) CHECK (identity IN ('Senior', 'Youth')),
        language VARCHAR(10) DEFAULT 'en',
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        root_points INTEGER DEFAULT 0,
        total_sessions_attended INTEGER DEFAULT 0,
        total_stories_shared INTEGER DEFAULT 0,
        total_teachings_given INTEGER DEFAULT 0,
        is_onboarded BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        last_seen_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    console.log('✅ Users table ready');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        font_size VARCHAR(20) DEFAULT 'medium',
        high_contrast BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        profile_visibility VARCHAR(20) DEFAULT 'public',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✅ User preferences table ready');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

setupDatabase();