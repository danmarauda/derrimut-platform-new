#!/bin/bash
# Disk Space Cleanup Script for Derrimut Platform
# Removes build artifacts, caches, and temporary files

echo "🧹 Starting disk space cleanup..."

# Get current disk usage
echo ""
echo "📊 Current disk usage:"
df -h . | tail -1

# Clean build artifacts
echo ""
echo "🗑️  Cleaning build artifacts..."
find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null
find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null
find . -type d -name "build" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.tsbuildinfo" -delete 2>/dev/null
find . -type f -name "*.log" -delete 2>/dev/null
echo "✅ Build artifacts cleaned"

# Clean cache directories
echo ""
echo "🗑️  Cleaning cache directories..."
find . -type d -name ".turbo" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".expo" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".expo-shared" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".cache" -exec rm -rf {} + 2>/dev/null
find . -type d -name "coverage" -exec rm -rf {} + 2>/dev/null
echo "✅ Cache directories cleaned"

# Clean system files
echo ""
echo "🗑️  Cleaning system files..."
find . -type f -name ".DS_Store" -delete 2>/dev/null
find . -type f -name "Thumbs.db" -delete 2>/dev/null
echo "✅ System files cleaned"

# Show largest directories (for manual review)
echo ""
echo "📊 Largest directories (for manual review):"
du -sh */node_modules 2>/dev/null | sort -hr | head -5 || echo "No node_modules found"

# Final disk usage
echo ""
echo "📊 Final disk usage:"
df -h . | tail -1

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "💡 To free more space, you can:"
echo "   - Remove node_modules: find . -name 'node_modules' -type d -prune -exec rm -rf {} +"
echo "   - Remove .git directories: find . -name '.git' -type d -prune -exec rm -rf {} +"
echo "   - Clean npm cache: npm cache clean --force"
echo "   - Clean yarn cache: yarn cache clean"
echo "   - Clean pnpm cache: pnpm store prune"

