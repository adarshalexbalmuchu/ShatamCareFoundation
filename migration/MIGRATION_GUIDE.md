# Supabase Project Migration Guide

## Overview
This guide helps you migrate your Supabase project from one account to another. Since Supabase doesn't support direct project transfers, we'll migrate all data and configurations.

## Current Project Details
Replace placeholders with your actual values when running scripts.
- **Source Project Ref**: `<SOURCE_REF>`
- **Source URL**: `https://<SOURCE_REF>.supabase.co`

## Migration Options

### Option 1: Complete Migration (Recommended)

#### Prerequisites
1. Access to current Supabase project (source)
2. New Supabase project created in target account
3. Supabase CLI installed
4. Database admin access to both projects

#### Step 1: Backup Current Project (Automated Option Recommended)

You can now use the orchestrator script for guided export/import:

```bash
node -v   # ensure Node is installed
./migration/migrate-project.sh   # choose option 1 for export
```

This will produce:
- `migration/database/schema_export.sql`
- `migration/database/data_export.sql` (if full export chosen)
- `migration/database/*.csv` (all or selected tables)
- `migration/storage/*` (all buckets + manifest)

Manual commands (alternative) below.

##### 1.1 Export Database Schema and Data
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase CLI with your current account
supabase login

# Initialize local Supabase project
supabase init

# Link to your current project
supabase link --project-ref <SOURCE_REF>

# (Optional) Generate migration diff (if you use migrations workflow)
supabase db diff --schema public --use-migra > migration/database/initial_schema.sql

# Export data using pg_dump (you'll need your database password)
# Get connection string from Supabase dashboard -> Settings -> Database
# (Optional manual full data export if not using orchestrator)
pg_dump "postgresql://postgres:[PASSWORD]@db.<SOURCE_REF>.supabase.co:5432/postgres" \
  --schema=public --data-only --inserts --no-owner --no-privileges > migration/database/data_export.sql
```

##### 1.2 Export Storage Files
```bash
# Create storage backup script
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY> SUPABASE_URL_OVERRIDE=https://<SOURCE_REF>.supabase.co node migration/export-storage.js
```

##### 1.3 Export Edge Functions
```bash
# Copy your edge functions
cp -r supabase/functions migration/functions/
```

#### Step 2: Set Up New Project

##### 2.1 Get New Project Credentials
1. Go to new Supabase project dashboard
2. Copy the new project URL and anon key
3. Note the new project ID

##### 2.2 Update Environment Variables
```bash
# Update .env files with new credentials
VITE_SUPABASE_URL=https://[NEW_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[NEW_ANON_KEY]
```

#### Step 3: Import to New Project

##### 3.1 Import Database Schema (Orchestrator)

```bash
./migration/migrate-project.sh   # choose option 2 for import
```

Manual alternative:
```bash
# Link CLI to new project (if using migrations rather than raw exported schema)
supabase link --project-ref <NEW_PROJECT_ID>
supabase db push   # if using migration-based workflow
psql "postgresql://postgres:[NEW_PASSWORD]@db.<NEW_PROJECT_ID>.supabase.co:5432/postgres" -f migration/database/schema_export.sql  # raw file import
```

##### 3.2 Import Data
```bash
# Import data using psql
psql "postgresql://postgres:[NEW_PASSWORD]@db.[NEW_PROJECT_ID].supabase.co:5432/postgres" \
  -f migration/database/data_export.sql
```

##### 3.3 Import Storage Files
```bash
# Upload storage files using the import script
NEW_SUPABASE_URL=https://<NEW_PROJECT_ID>.supabase.co NEW_SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY> node migration/import-storage.js
```

##### 3.4 Deploy Edge Functions
```bash
# Deploy functions to new project
supabase functions deploy
```

### Option 2: Manual Export/Import via Dashboard

#### For Database:
1. **Export Schema**: Use SQL editor to run schema export queries
2. **Export Data**: Use `COPY` commands or manual CSV exports
3. **Import to New Project**: Run the exported SQL in new project

#### For Storage:
1. **Download Files**: Use Supabase dashboard or API
2. **Upload to New Project**: Use new project's storage interface

### Option 3: Request Supabase Support

#### Contact Supabase directly:
1. Open a support ticket at support@supabase.io
2. Explain you need to transfer project ownership
3. Provide both account emails and project details
4. They might be able to help with direct transfer

## Important Considerations

### 🚨 Critical Points:
1. **Downtime**: Plan for potential downtime during migration
2. **Testing**: Test the new project thoroughly before switching
3. **DNS/Domain**: Update any custom domains to point to new project
4. **API Keys**: All API keys will change
5. **Webhooks**: Update any webhook URLs
6. **Third-party Integrations**: Update all external service configurations

### 🔄 Rollback Plan:
- Keep old project active until migration is confirmed successful
- Have a rollback plan to switch back if issues arise
- Test all functionality in new project before decommissioning old one

### 📝 Migration Checklist:
- [ ] Source schema exported (or migrations captured)
- [ ] Table data CSVs exported
- [ ] Storage buckets exported (recursive)
- [ ] Edge functions copied (if any)
- [ ] New project created (extensions enabled)
- [ ] Schema imported
- [ ] Data imported
- [ ] Storage imported
- [ ] RLS policies verified
- [ ] Environment variables updated (.env files)
- [ ] Frontend rebuilt & deployed
- [ ] Admin features tested (settings, programs, events)
- [ ] Webhooks / third-party integrations updated
- [ ] Old project set read-only (grace period)
- [ ] Old project deleted (after confirmation)

## Post-Migration Tasks

1. **Update Repository Secrets**: If using CI/CD, update all Supabase-related secrets
2. **Update Documentation**: Update any documentation with new project details
3. **Monitor Performance**: Ensure new project performs as expected
4. **Update Team Access**: Add team members to new project
5. **Clean Up**: Remove old project once migration is confirmed successful

## Need Help?

If you encounter issues during migration:
1. Check Supabase documentation: https://supabase.com/docs
2. Contact Supabase support: support@supabase.io
3. Use Supabase Discord community for quick help
4. Review migration logs for specific error messages

## Files Created for Migration:
- `migration/migrate-project.sh` - Main migration script
- `migration/export-schema.sql` - Schema export queries
- `migration/database/` - Database exports
- `migration/storage/` - Storage file backups
- `migration/config/` - Configuration backups
