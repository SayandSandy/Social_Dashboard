const postgres = require('postgres');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = env.match(/DATABASE_URL=(.*)/);
if (!dbUrlMatch) throw new Error('No DATABASE_URL');

// Replace pooler port 6543 with direct connection port 5432
const url = dbUrlMatch[1].trim().replace(':6543', ':5432');

const sql = postgres(url, { max: 1 });

async function run() {
  try {
    await sql`ALTER TABLE users ADD COLUMN google_sheet_id text;`;
    console.log('Added google_sheet_id column');
  } catch (e) {
    console.log('Maybe already added:', e.message);
  }
  
  await sql.end();
  process.exit(0);
}
run();
