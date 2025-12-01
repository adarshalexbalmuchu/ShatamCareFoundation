const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration from environment
const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || process.env.SUPABASE_URL || '';
const NEW_SERVICE_ROLE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!NEW_SUPABASE_URL) {
  console.error('❌ NEW_SUPABASE_URL (or SUPABASE_URL) env var required');
  process.exit(1);
}
if (!NEW_SERVICE_ROLE_KEY) {
  console.error('❌ NEW_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) env var required');
  process.exit(1);
}

const supabase = createClient(NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY);

async function importStorageFiles() {
  console.log('📤 Importing storage files to new project...');
  
  try {
    const storageDir = path.join(__dirname, 'storage');
    
    if (!fs.existsSync(storageDir)) {
      console.error('❌ Storage backup directory not found. Run export-storage.js first.');
      return;
    }

    // Read manifest
    const manifestPath = path.join(storageDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.error('❌ Storage manifest not found.');
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`📋 Found manifest with ${manifest.buckets.length} buckets`);

  for (const bucketInfo of manifest.buckets) {
      console.log(`\n🪣 Creating bucket: ${bucketInfo.name}`);
      
      // Create bucket in new project
      const { data: bucket, error: bucketError } = await supabase.storage.createBucket(
        bucketInfo.name,
        { public: bucketInfo.public }
      );

      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error(`❌ Error creating bucket ${bucketInfo.name}:`, bucketError);
        continue;
      }

      const bucketDir = path.join(storageDir, bucketInfo.name);
      
      if (!fs.existsSync(bucketDir)) {
        console.log(`⚠️ No files found for bucket ${bucketInfo.name}`);
        continue;
      }

      // Recursively gather file paths
      const gatherFiles = (dir, prefix = '') => {
        const out = [];
        for (const entry of fs.readdirSync(dir)) {
          const entryPath = path.join(dir, entry);
            const rel = prefix ? `${prefix}/${entry}` : entry;
            const stat = fs.statSync(entryPath);
            if (stat.isDirectory()) {
              out.push(...gatherFiles(entryPath, rel));
            } else {
              out.push(rel);
            }
        }
        return out;
      };
      const files = gatherFiles(bucketDir);
      console.log(`📁 Uploading ${files.length} files to bucket ${bucketInfo.name}`);
      for (const relPath of files) {
        try {
          const filePath = path.join(bucketDir, relPath);
          const fileBuffer = fs.readFileSync(filePath);
          const { error } = await supabase.storage
            .from(bucketInfo.name)
            .upload(relPath, fileBuffer, { upsert: true, contentType: getContentType(relPath) });
          if (error) { console.error(`❌ ${relPath}:`, error); continue; }
          console.log(`✅ ${relPath}`);
        } catch (err) {
          console.error(`❌ Error processing file ${relPath}:`, err);
        }
      }
    }

    console.log('\n✅ Storage import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.mp4': 'video/mp4',
    '.avi': 'video/avi',
    '.mov': 'video/quicktime'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Configuration validation
// Run the import
if (require.main === module) {
  importStorageFiles();
}

module.exports = { importStorageFiles };
