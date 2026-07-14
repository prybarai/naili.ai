#!/bin/bash

# 🚀 QUICK DEPLOY SCRIPT FOR NAILI.AI POLISHED DESIGN
# Run this script to deploy the polished design to naili.ai

echo "🚀 Starting deployment of polished Naili design..."
echo "=================================================="

cd /home/ubuntu/.openclaw/workspace/prybar

# Step 1: Install required dependency
echo "📦 Installing canvas-confetti..."
npm install canvas-confetti

# Step 2: Create backup of current files
echo "💾 Creating backup of current production files..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "../$BACKUP_DIR"
cp app/vision/start/page.tsx "../$BACKUP_DIR/"
cp components/vision/VisionStartFlow.tsx "../$BACKUP_DIR/"
cp tailwind.config.ts "../$BACKUP_DIR/"
cp app/globals.css "../$BACKUP_DIR/"
echo "✅ Backup created in ../$BACKUP_DIR"

# Step 3: Deploy the polished design
echo "🎨 Deploying polished design system..."

# Update the main vision flow to use polished system
cat > app/vision/start/page.tsx << 'EOF'
'use client';

import { ProjectProvider } from '@/lib/ProjectContext';
import NailiOrchestrator from '@/components/vision/NailiOrchestrator';
import ProjectAutoSaver from '@/components/vision/ProjectAutoSaver';

export default function VisionStartPage() {
  return (
    <ProjectProvider>
      <NailiOrchestrator />
      <ProjectAutoSaver />
    </ProjectProvider>
  );
}
EOF

echo "✅ Updated main vision page"

# Step 4: Verify the build
echo "🔧 Building project to check for errors..."
if npm run build 2>&1 | grep -q "error"; then
    echo "❌ Build failed! Check errors above."
    echo "🔄 Restoring backup..."
    cp "../$BACKUP_DIR/page.tsx" app/vision/start/page.tsx
    cp "../$BACKUP_DIR/VisionStartFlow.tsx" components/vision/VisionStartFlow.tsx
    cp "../$BACKUP_DIR/tailwind.config.ts" tailwind.config.ts
    cp "../$BACKUP_DIR/globals.css" app/globals.css
    echo "✅ Restored from backup"
    exit 1
else
    echo "✅ Build successful!"
fi

# Step 5: Deployment instructions
echo ""
echo "=================================================="
echo "🚀 POLISHED DESIGN READY FOR DEPLOYMENT!"
echo "=================================================="
echo ""
echo "The polished design includes:"
echo "• Professional progress indicator (6 steps)"
echo "• Updated color palette (#0066D6 blue)"
echo "• Cost estimation inspired by RenovateAI"
echo "• Smooth transitions and animations"
echo "• Auto-save functionality"
echo "• Affiliate-ready materials cart"
echo ""
echo "📋 To deploy to naili.ai:"
echo ""
echo "OPTION A: If using Vercel/Git auto-deploy:"
echo "  git add ."
echo "  git commit -m '🚀 Deploy polished design system'"
echo "  git push origin main"
echo ""
echo "OPTION B: If deploying manually:"
echo "  Deploy these updated files:"
echo "  1. app/vision/start/page.tsx"
echo "  2. components/vision/NailiOrchestrator.tsx"
echo "  3. lib/ProjectContext.tsx"
echo "  4. tailwind.config.ts"
echo "  5. app/globals.css"
echo "  6. package.json (with canvas-confetti)"
echo ""
echo "OPTION C: Create a preview deployment:"
echo "  vercel --prod  # If Vercel CLI is installed"
echo ""
echo "🌐 After deployment, visit: https://naili.ai/vision/start"
echo ""
echo "🔄 To rollback if needed:"
echo "  cp ../$BACKUP_DIR/* ."
echo "=================================================="