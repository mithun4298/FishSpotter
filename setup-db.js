const { Client } = require('pg');
require('dotenv').config();

async function createSessionsTable() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create sessions table for connect-pg-simple
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `;
    
    await client.query(createSessionsTable);
    console.log('Sessions table created successfully');
    
    // Add primary key constraint if it doesn't exist
    const addPrimaryKey = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'sessions_pkey' AND table_name = 'sessions'
        ) THEN
          ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);
        END IF;
      END $$;
    `;
    
    await client.query(addPrimaryKey);
    console.log('Primary key constraint added');
    
    // Create index if it doesn't exist
    const createIndex = `
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `;
    
    await client.query(createIndex);
    console.log('Session expire index created');
    
    // Also ensure users table has hashedPassword column
    const addHashedPasswordColumn = `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS hashedPassword VARCHAR;
    `;
    
    await client.query(addHashedPasswordColumn);
    console.log('Users table updated with hashedPassword column');
    
    await client.end();
    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

createSessionsTable();
