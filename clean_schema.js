
import fs from 'fs';

const content = fs.readFileSync('schema_only.sql', 'utf8');

let cleaned = content
  .split('\n')
  .filter(line => !line.startsWith('\\restrict') && !line.startsWith('\\unrestrict'))
  .join('\n');

// Specific replacements
cleaned = cleaned.replace(/CREATE SCHEMA public;/g, 'CREATE SCHEMA IF NOT EXISTS public;');
cleaned = cleaned.replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ');
cleaned = cleaned.replace(/CREATE TYPE /g, 'CREATE TYPE IF NOT EXISTS ');
cleaned = cleaned.replace(/CREATE FUNCTION /g, 'CREATE OR REPLACE FUNCTION ');

// Also handle the search_path setting if pg_dump set it to empty
cleaned = cleaned.replace(/SELECT pg_catalog.set_config\('search_path', '', false\);/g, "SET search_path = public, auth, storage;");

fs.writeFileSync('schema_only.sql', cleaned);
console.log('schema_only.sql has been cleaned and updated.');
