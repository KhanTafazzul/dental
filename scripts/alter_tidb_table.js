const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manually parse env file
const envPath = path.join(__dirname, '../.env.local');
const envConfig = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
      envConfig[key] = val;
    }
  });
}

async function run() {
  const host = envConfig.TIDB_HOST;
  const user = envConfig.TIDB_USER;
  const password = envConfig.TIDB_PASSWORD;
  const database = envConfig.TIDB_DATABASE || 'test';
  const port = parseInt(envConfig.TIDB_PORT || '4000', 10);

  if (password === '<PASSWORD>') {
    console.log('Skipping TiDB alter: local password placeholder is still active.');
    return;
  }

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });

  const migrations = [
    {
      name: 'medicines.tablets_per_patch',
      sql: 'ALTER TABLE medicines ADD COLUMN tablets_per_patch INT NOT NULL DEFAULT 10'
    },
    {
      name: 'medicine_batches.cost_price',
      sql: 'ALTER TABLE medicine_batches ADD COLUMN cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00'
    },
    {
      name: 'medicine_batches.branch_slug',
      sql: "ALTER TABLE medicine_batches ADD COLUMN branch_slug VARCHAR(50) NOT NULL DEFAULT 'hazara'"
    },
    {
      name: 'medicine_batches.mrp',
      sql: 'ALTER TABLE medicine_batches ADD COLUMN mrp DECIMAL(10, 2) NOT NULL DEFAULT 0.00'
    }
  ];

  for (const m of migrations) {
    try {
      console.log(`Applying migration: ${m.name}...`);
      await connection.query(m.sql);
      console.log(`- Succeeded: ${m.name}`);
    } catch (err) {
      if (err.message.includes('Duplicate column') || err.message.includes('already exists')) {
        console.log(`- Column already exists: ${m.name}`);
      } else {
        console.error(`- Failed to apply ${m.name}:`, err.message);
      }
    }
  }

  await connection.end();
}

run();
