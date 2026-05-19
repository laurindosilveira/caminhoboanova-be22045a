
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportAuthData() {
  const { data, error } = await supabase
    .from('temp_auth_export')
    .select('line')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }

  const sqlContent = [
    '-- COMPLETO: 41 usuários e suas identidades',
    'SET session_replication_role = replica;',
    '',
    ...data.map(row => row.line),
    '',
    'RESET session_replication_role;',
    '',
    '-- Validação final',
    'SELECT count(*) AS total_users FROM auth.users;',
    'SELECT count(*) AS total_identities FROM auth.identities;'
  ].join('\n');

  fs.writeFileSync('auth_data.sql', sqlContent);
  console.log('auth_data.sql generated successfully with ' + data.length + ' lines.');
}

exportAuthData();
