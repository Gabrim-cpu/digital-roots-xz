import { pool } from '../config/database.js';

export const handleAuth = async (req, res) => {
  const { uid, email, name, picture } = req.firebaseUser;
  const { identity, language, picture: uploadedPicture } = req.body;
  const avatarUrl = uploadedPicture || picture || null;
  
  try {
    let result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );
    
    let user;
    let isNewUser = false;
    
    if (result.rows.length === 0) {
      isNewUser = true;
      result = await pool.query(
        `INSERT INTO users (firebase_uid, email, display_name, identity, language, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [uid, email, name || email.split('@')[0], identity || null, language || 'en', avatarUrl]
      );
      user = result.rows[0];
    } else {
      user = result.rows[0];
      await pool.query(
        `UPDATE users
         SET last_seen_at = NOW(),
             avatar_url = COALESCE($1, avatar_url)
         WHERE id = $2`,
        [avatarUrl, user.id]
      );
      user.avatar_url = avatarUrl || user.avatar_url;
    }
    
    res.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        identity: user.identity,
        language: user.language,
        avatar_url: user.avatar_url,
        root_points: user.root_points || 0,
        is_onboarded: !!user.identity,
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [req.firebaseUser.uid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { identity, language, display_name, avatar_url } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE users 
       SET identity = COALESCE($1, identity),
           language = COALESCE($2, language),
           display_name = COALESCE($3, display_name),
           avatar_url = COALESCE($4, avatar_url),
           is_onboarded = CASE WHEN $1 IS NOT NULL THEN true ELSE is_onboarded END
       WHERE firebase_uid = $5 
       RETURNING *`,
      [identity, language, display_name, avatar_url, req.firebaseUser.uid]
    );
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
