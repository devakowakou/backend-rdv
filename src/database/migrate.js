const pool = require('../config/database');

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    sexe VARCHAR(10) NOT NULL CHECK (sexe IN ('Masculin', 'Feminin')),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'patient', 'docteur')),
    adresse TEXT NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
  'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
  'CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);'
];

async function runMigrations() {
  try {
    console.log('🚀 Début des migrations...');
    
    // Vérifier la connexion
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données vérifiée');
    
    // Créer la table users
    await pool.query(createUsersTable);
    console.log('✅ Table users créée');
    
    // Créer les index un par un
    for (const indexQuery of createIndexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Index créés');
    
    // Vérifier la structure de la table
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Structure de la table users:');
    tableInfo.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('🎉 Migrations terminées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error.message);
    console.error('Code d\'erreur:', error.code);
    if (error.detail) console.error('Détail:', error.detail);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;