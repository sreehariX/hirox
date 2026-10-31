const fields=['CRUSTDATA_API_KEY','OPENAI_API_KEY','FIRECRAWL_API_KEY','SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_DB_URL'];
for(const key of fields)console.log(`${key}: ${process.env[key]?.trim()?'configured':'missing'}`);
console.log(`Storage: ${process.env.HIROX_STORAGE||'local'}`);
