#!/bin/bash

# Update Environment Variables for New Supabase Project
# This script helps you update all environment variables after migration

echo "🔧 Updating Environment Variables for New Supabase Project"
echo "=========================================================="

# Function to update env file
update_env_file() {
    local file=$1
    local new_url=$2
    local new_key=$3
    
    if [ -f "$file" ]; then
        echo "📝 Updating $file..."
        
        # Backup original file
        cp "$file" "$file.backup"
        
        # Update URL
        sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$new_url|g" "$file"
        
        # Update ANON KEY
        sed -i "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$new_key|g" "$file"
        
        echo "✅ Updated $file"
    else
        echo "⚠️ File $file not found"
    fi
}

# Get new project details
echo "Please provide your new Supabase project details:"
echo ""

read -p "New Project ID (e.g., abcdefghijklmnop): " NEW_PROJECT_ID
read -p "New Anon Key: " NEW_ANON_KEY

if [ -z "$NEW_PROJECT_ID" ] || [ -z "$NEW_ANON_KEY" ]; then
    echo "❌ Project ID and Anon Key are required!"
    exit 1
fi

NEW_URL="https://$NEW_PROJECT_ID.supabase.co"

echo ""
echo "🔄 Updating environment files..."

# Update all environment files
update_env_file ".env.example" "$NEW_URL" "$NEW_ANON_KEY"
update_env_file ".env.production" "$NEW_URL" "$NEW_ANON_KEY"
update_env_file ".env.local" "$NEW_URL" "$NEW_ANON_KEY"
update_env_file ".env" "$NEW_URL" "$NEW_ANON_KEY"

echo ""
echo "📝 Creating new environment template..."

cat > .env.new << EOF
# New Supabase Configuration
# Replace these with your actual new Supabase project values
VITE_SUPABASE_URL=$NEW_URL
VITE_SUPABASE_ANON_KEY=$NEW_ANON_KEY

# Note: Updated for new Supabase project
# Project ID: $NEW_PROJECT_ID
# Migration Date: $(date)

EOF

echo "✅ Created .env.new with new configuration"

echo ""
echo "🔍 Files updated:"
echo "- .env.example"
echo "- .env.production" 
echo "- .env.local (if exists)"
echo "- .env (if exists)"
echo "- .env.new (created)"

echo ""
echo "⚠️ Important Notes:"
echo "1. Backup files created with .backup extension"
echo "2. Update any CI/CD secrets with new values"
echo "3. Update any hardcoded URLs in your codebase"
echo "4. Test the application with new configuration"
echo "5. Update any webhook URLs in external services"

echo ""
echo "🔄 Next Steps:"
echo "1. Copy .env.new to .env.local for local development"
echo "2. Update production environment variables"
echo "3. Redeploy your application"
echo "4. Test all functionality"

echo ""
echo "✅ Environment update completed!"
