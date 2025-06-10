#!/usr/bin/env node

/**
 * CEA UI Refactor Script - Automated Design System Migration
 * Converts Tailwind defaults to ACT/CEA iOS design tokens
 * Usage: node scripts/ui-refactor.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Design token mapping rules
const REFACTOR_RULES = {
  // Typography - Convert to iOS hierarchy
  typography: {
    'text-4xl': 'text-ios-large-title',
    'text-3xl': 'text-ios-title-1', 
    'text-2xl': 'text-ios-title-2',
    'text-xl': 'text-ios-title-3',
    'text-lg': 'text-ios-headline',
    'text-base': 'text-ios-body',
    'text-sm': 'text-ios-subheadline',
    'text-xs': 'text-ios-footnote',
    'font-bold': 'font-sf-pro font-semibold',
    'font-medium': 'font-sf-pro font-medium',
    'font-normal': 'font-sf-pro font-normal',
    'font-helvetica': 'font-sf-pro',
    'font-inter': 'font-sf-pro',
  },
  
  // Border Radius - Convert to iOS system
  borderRadius: {
    'rounded-sm': 'rounded-ios',
    'rounded-md': 'rounded-ios-lg', 
    'rounded-lg': 'rounded-ios-xl',
    'rounded-xl': 'rounded-ios-2xl',
    'rounded-2xl': 'rounded-ios-2xl',
    'rounded-full': 'rounded-ios-full',
  },
  
  // Shadows - Convert to iOS shadows
  shadows: {
    'shadow-sm': 'shadow-ios-subtle',
    'shadow-md': 'shadow-ios-normal',
    'shadow-lg': 'shadow-ios-prominent', 
    'shadow-xl': 'shadow-ios-elevated',
    'shadow-2xl': 'shadow-ios-elevated',
  },
  
  // Colors - Convert to ACT brand colors
  colors: {
    'bg-blue-500': 'bg-ios-blue',
    'text-blue-500': 'text-ios-blue',
    'bg-green-500': 'bg-ios-green',
    'text-green-500': 'text-ios-green',
    'bg-red-500': 'bg-ios-red', 
    'text-red-500': 'text-ios-red',
    'bg-yellow-500': 'bg-ios-yellow',
    'text-yellow-500': 'text-ios-yellow',
    'bg-gray-100': 'bg-sand-gray/20',
    'bg-gray-200': 'bg-sand-gray/30',
    'text-gray-500': 'text-midnight-forest/70',
    'text-gray-600': 'text-midnight-forest/80',
    'text-gray-700': 'text-midnight-forest/90',
    'text-gray-900': 'text-midnight-forest',
  }
};

// Files to process
const TARGET_PATTERNS = [
  './app/**/*.tsx',
  './components/**/*.tsx', 
  './contexts/**/*.tsx',
  './hooks/**/*.tsx'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  './node_modules/**',
  './.next/**',
  './act-brand-demo/**', // Already converted
];

function getAllFiles() {
  let allFiles = [];
  
  TARGET_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, { 
      ignore: EXCLUDE_PATTERNS,
      absolute: true 
    });
    allFiles = [...allFiles, ...files];
  });
  
  return [...new Set(allFiles)]; // Remove duplicates
}

function applyRefactorRules(content) {
  let updatedContent = content;
  let changes = [];
  
  // Apply all refactor rules
  Object.keys(REFACTOR_RULES).forEach(category => {
    const rules = REFACTOR_RULES[category];
    
    Object.keys(rules).forEach(oldClass => {
      const newClass = rules[oldClass];
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      
      if (regex.test(updatedContent)) {
        const matches = updatedContent.match(regex);
        if (matches) {
          changes.push({
            category,
            old: oldClass,
            new: newClass,
            count: matches.length
          });
          
          updatedContent = updatedContent.replace(regex, newClass);
        }
      }
    });
  });
  
  return { content: updatedContent, changes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: updatedContent, changes } = applyRefactorRules(content);
    
    if (changes.length > 0) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => {
        console.log(`   ${change.old} → ${change.new} (${change.count}x)`);
      });
      
      return { file: filePath, changes };
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return null;
  }
}

function generateReport(results) {
  const totalFiles = results.filter(r => r !== null).length;
  const totalChanges = results
    .filter(r => r !== null)
    .reduce((sum, r) => sum + r.changes.length, 0);
  
  console.log('\n📊 REFACTOR SUMMARY');
  console.log('='.repeat(50));
  console.log(`Files processed: ${totalFiles}`);
  console.log(`Total changes: ${totalChanges}`);
  
  // Category breakdown
  const categoryStats = {};
  results.forEach(result => {
    if (result) {
      result.changes.forEach(change => {
        if (!categoryStats[change.category]) {
          categoryStats[change.category] = 0;
        }
        categoryStats[change.category] += change.count;
      });
    }
  });
  
  console.log('\nChanges by category:');
  Object.keys(categoryStats).forEach(category => {
    console.log(`  ${category}: ${categoryStats[category]} changes`);
  });
}

// Main execution
function main() {
  console.log('🚀 Starting CEA UI Refactor...');
  console.log('Converting Tailwind defaults → ACT/CEA design tokens\n');
  
  const files = getAllFiles();
  console.log(`Found ${files.length} files to process\n`);
  
  const results = files.map(processFile);
  
  generateReport(results);
  
  console.log('\n🎉 CEA UI Refactor Complete!');
  console.log('Next steps:');
  console.log('1. Review changes with git diff');
  console.log('2. Test components in browser');
  console.log('3. Run: npm run build');
}

if (require.main === module) {
  main();
}

module.exports = { applyRefactorRules, REFACTOR_RULES }; 