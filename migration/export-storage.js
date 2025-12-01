const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration priority: explicit env overrides > legacy VITE vars > fail
const CURRENT_SUPABASE_URL = process.env.SUPABASE_URL_OVERRIDE || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '';
if (!CURRENT_SUPABASE_URL) {
  console.error('❌ SUPABASE_URL not provided (set SUPABASE_URL_OVERRIDE or VITE_SUPABASE_URL)');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error('❌ SERVICE ROLE key not provided (set SUPABASE_SERVICE_ROLE_KEY)');
  console.error('   Storage listing may fail with anon key due to bucket policies.');
}

const supabase = createClient(CURRENT_SUPABASE_URL, SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function listAllFiles(bucket, prefix = '') {
  const acc = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
  if (error) { throw error; }
  for (const entry of data) {
    if (entry.name.endsWith('.')) continue;
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id && entry.created_at && typeof entry.size === 'number' && entry.metadata === null || entry.last_accessed_at) {
      // heuristic: treat as file
    }
    if (entry.name && entry.id && entry.created_at && entry.updated_at && entry.metadata === null && entry.last_accessed_at === null && entry.buckets === undefined && entry.size === null) {
      // skip weird entries
    }
    if (entry.name && entry.created_at && entry.updated_at && entry.id && entry.metadata === null && entry.last_accessed_at === null && entry.size === null) {
      // folder like, we already check type; continue
    }
    if (entry.name && entry.id && entry.created_at && entry.updated_at && entry.last_accessed_at === null && entry.metadata === null && entry.size === null) {
      // Possibly a folder; rely on entry.type if exists
    }
    if (entry.name && entry.type === 'folder') {
      const nested = await listAllFiles(bucket, fullPath);
      acc.push(...nested);
    } else if (entry.name) {
      acc.push(fullPath);
    }
  }
  return acc;
}

async function exportStorageFiles() {
  console.log('🗄️ Exporting storage files...');
  
  try {
    // Create storage backup directory
    const storageDir = path.join(__dirname, 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

  // List all storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError);
      return;
    }

    console.log(`📁 Found ${buckets.length} storage buckets`);

    for (const bucket of buckets) {
      console.log(`\n📂 Processing bucket: ${bucket.name}`);
      
      // Create bucket directory
      const bucketDir = path.join(storageDir, bucket.name);
      if (!fs.existsSync(bucketDir)) {
        fs.mkdirSync(bucketDir, { recursive: true });
      }

      // Recursively list all files
      let files = [];
      try {
        files = await listAllFiles(bucket.name, '');
      } catch (e) {
        console.error(`❌ Error listing files recursively in bucket ${bucket.name}:`, e);
        continue;
      }
      console.log(`📄 Found ${files.length} files (recursive) in bucket ${bucket.name}`);

      for (const relativePath of files) {
        try {
            const { data, error } = await supabase.storage
              .from(bucket.name)
              .download(relativePath);
            if (error) { console.error(`❌ Download error ${relativePath}:`, error); continue; }
            const outPath = path.join(bucketDir, relativePath);
            const outDir = path.dirname(outPath);
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            const buffer = Buffer.from(await data.arrayBuffer());
            fs.writeFileSync(outPath, buffer);
            console.log(`✅ ${relativePath}`);
        } catch (err) {
            console.error(`❌ Error processing file ${relativePath}:`, err);
        }
      }
    }

    // Create manifest file
    const manifest = {
      exportDate: new Date().toISOString(),
      projectUrl: CURRENT_SUPABASE_URL,
      buckets: buckets.map(b => ({
        name: b.name,
        id: b.id,
        public: b.public,
        createdAt: b.created_at,
        updatedAt: b.updated_at
      }))
    };

    fs.writeFileSync(
      path.join(storageDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('\n✅ Storage export completed!');
    console.log(`📁 Files saved to: ${storageDir}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

// Run the export
if (require.main === module) {
  exportStorageFiles();
}

module.exports = { exportStorageFiles };
