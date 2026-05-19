const fs = require('fs');

function formatVal(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'string') return "'" + val.replace(/'/g, "''") + "'";
  if (typeof val === 'object') return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
  return val;
}

function generateInserts(table, data) {
  if (!data || data.length === 0) return `-- No data for ${table}\n`;
  const columns = Object.keys(data[0]);
  let sql = `-- Data for ${table}\n`;
  data.forEach(row => {
    const vals = columns.map(col => formatVal(row[col]));
    sql += `INSERT INTO auth.${table} (${columns.join(', ')}) VALUES (${vals.join(', ')});\n`;
  });
  return sql;
}

// These values are placeholders, I'll replace them with the actual data in the next step
const usersData = []; 
const identitiesData = [];

// Actually, I'll read the JSON from a file to avoid escaping issues in the heredoc
const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
const identities = JSON.parse(fs.readFileSync('identities.json', 'utf8'));

let finalSql = "BEGIN;\nSET session_replication_role = 'replica';\n\n";
finalSql += generateInserts('users', users);
finalSql += "\n";
finalSql += generateInserts('identities', identities);
finalSql += "\nSET session_replication_role = 'origin';\nCOMMIT;";

fs.writeFileSync('/mnt/documents/auth_data.sql', finalSql);
