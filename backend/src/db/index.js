const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS releases (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      date TIMESTAMP NOT NULL,
      additional_info TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS release_steps (
      id SERIAL PRIMARY KEY,
      release_id INTEGER REFERENCES releases(id) ON DELETE CASCADE,
      step_key VARCHAR(100) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      UNIQUE(release_id, step_key)
    );
  `);
  console.log('Database initialized');
};

module.exports = { pool, initDb };
