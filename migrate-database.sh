#!/bin/bash

# 🔧 Database Tag Migration - Quick Start Script
# This script walks you through updating your 73 Compensar products

set -e

echo "🌿 BeHuman - Compensar Database Tag Migration"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root. Run from: /home/asperjasp/asperjasp/Projects/human/BeHuman"
    exit 1
fi

# Check Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not installed"
    exit 1
fi

echo "📋 STEP 1: Preview Changes"
echo "──────────────────────────"
echo "This will show what tags will be assigned to your first 10 products"
echo "No database changes will be made."
echo ""
echo "Run this command:"
echo "  npx ts-node Typescript-Integration/fix-tags.ts --preview"
echo ""
read -p "Press Enter when ready... "
npx ts-node Typescript-Integration/fix-tags.ts --preview

echo ""
echo ""
echo "📊 STEP 2: Review the Preview"
echo "────────────────────────────"
echo "✅ Do the situation_tags and profile_tags look correct?"
echo "✅ Are the age categories (joven/adulto/mayor) right?"
echo "✅ Do the hobbies and goals make sense?"
echo ""
read -p "Continue to update ALL 73 products? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled. No changes made."
    exit 0
fi

echo ""
echo ""
echo "🚀 STEP 3: Update All 73 Products"
echo "────────────────────────────────"
echo "This will update ALL products in your Compensar-Database"
echo ""
read -p "This is the final step. Are you sure? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "❌ Cancelled. No changes made."
    exit 0
fi

echo ""
echo "⏳ Updating products (this may take a minute)..."
echo ""
npx ts-node Typescript-Integration/fix-tags.ts --update

echo ""
echo ""
echo "✅ DATABASE UPDATE COMPLETE!"
echo "═════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Verify in admin dashboard: http://localhost:3000/admin/dashboard"
echo "  2. Test chat detection: Message with emotional content"
echo "  3. Check recommendations appear with proper tags"
echo ""
echo "To manually adjust tags:"
echo "  Edit any product in Supabase and update:"
echo "    situation_tags: ['muerte_familiar', 'causa_economica', ...]"
echo "    profile_tags: ['joven', 'adulto', 'deportes', ...]"
echo ""
echo "For detailed guide, see: DATABASE_MIGRATION_GUIDE.md"
