import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// CONFIGURAÇÃO
const SOURCE_URL = process.env.SOURCE_SUPABASE_URL;
const SOURCE_KEY = process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY;
const DEST_URL = process.env.DEST_SUPABASE_URL;
const DEST_KEY = process.env.DEST_SUPABASE_SERVICE_ROLE_KEY;

const sourceClient = createClient(SOURCE_URL, SOURCE_KEY);
const destClient = createClient(DEST_URL, DEST_KEY);

async function migrateStorage() {
  console.log('--- Iniciando Migração de Storage ---');
  
  // 1. Listar Buckets
  const { data: buckets, error: bucketError } = await sourceClient.storage.listBuckets();
  if (bucketError) throw bucketError;

  for (const bucket of buckets) {
    console.log(`\nProcessando bucket: ${bucket.name}`);
    
    // Garantir que o bucket existe no destino
    const { error: createBucketError } = await destClient.storage.createBucket(bucket.name, {
      public: bucket.public
    });
    if (createBucketError && !createBucketError.message.includes('already exists')) {
      console.error(`Erro ao criar bucket ${bucket.name}:`, createBucketError.message);
      continue;
    }

    await migrateFolder(bucket.name, '');
  }
}

async function migrateFolder(bucketName, folderPath) {
  const { data: files, error: listError } = await sourceClient.storage.from(bucketName).list(folderPath);
  
  if (listError) {
    console.error(`Erro ao listar ${bucketName}/${folderPath}:`, listError.message);
    return;
  }

  for (const file of files) {
    const fullPath = folderPath ? `${folderPath}/${file.name}` : file.name;
    
    if (file.id === null) {
      // É uma pasta (no Supabase Storage, pastas não têm ID na listagem)
      await migrateFolder(bucketName, fullPath);
    } else {
      // É um arquivo
      console.log(`Transferindo: ${bucketName}/${fullPath}`);
      
      try {
        const { data: blob, error: downloadError } = await sourceClient.storage.from(bucketName).download(fullPath);
        if (downloadError) throw downloadError;

        const { error: uploadError } = await destClient.storage.from(bucketName).upload(fullPath, blob, {
          upsert: true,
          contentType: file.metadata?.mimetype
        });
        if (uploadError) throw uploadError;
        
      } catch (err) {
        fs.appendFileSync('storage_errors.log', `${new Date().toISOString()} - ${bucketName}/${fullPath}: ${err.message}\n`);
        console.error(`Falha em ${fullPath}:`, err.message);
      }
    }
  }
}

migrateStorage().catch(err => console.error('Erro Fatal:', err));
