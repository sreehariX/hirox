import postgres from 'postgres';
import { readFile } from 'node:fs/promises';
if(!process.env.SUPABASE_DB_URL){console.error('SUPABASE_DB_URL is missing. Add your Session pooler connection string to .env.local.');process.exit(1);}
const sql=postgres(process.env.SUPABASE_DB_URL,{ssl:'require',max:1,prepare:false,connect_timeout:20});
try {await sql.unsafe(await readFile(new URL('../supabase/migrations/001_hirox.sql',import.meta.url),'utf8'));console.log('Supabase tables created; public access restricted to server role.');}
catch(e){console.error('Database setup failed:',String(e.message).split(process.env.SUPABASE_DB_URL).join('[redacted]'));process.exitCode=1;}
finally{await sql.end();}
