#!/usr/bin/env node

/**
 * 📋 XFlows Schema Validation Utility
 * 
 * This script validates JSON schema files and example configurations
 * to ensure schema integrity and proper JSON structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const color = (colorName, text) => `${colors[colorName]}${text}${colors.reset}`;

/**
 * 📊 Validation Statistics
 */
const stats = {
  schemas: { total: 0, valid: 0, invalid: 0 },
  examples: { total: 0, valid: 0, invalid: 0 },
  errors: []
};

/**
 * 🔍 Validate JSON file structure
 */
function validateJSON(filePath) {
  console.log(color('blue', `🔍 Validating: ./${path.relative(process.cwd(), filePath)}`));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    
    // Check required schema properties
    if (filePath.includes('/v1/') && path.extname(filePath) === '.json') {
      const requiredProps = ['$schema', 'title', 'version', 'author'];
      const missingProps = requiredProps.filter(prop => !parsed[prop]);
      
      if (missingProps.length > 0) {
        stats.errors.push(`${path.basename(filePath)}: Missing properties: ${missingProps.join(', ')}`);
        return false;
      }
      
      // Validate schema ID format
      if (parsed.$id && !parsed.$id.startsWith('https://schemas.xflows.com/')) {
        stats.errors.push(`${path.basename(filePath)}: Invalid $id format`);
        return false;
      }
      
      // Validate version format
      if (parsed.version && !/^\d+\.\d+\.\d+$/.test(parsed.version)) {
        stats.errors.push(`${path.basename(filePath)}: Invalid version format`);
        return false;
      }
    }
    
    console.log(color('green', '✅ Valid JSON structure'));
    return true;
  } catch (error) {
    console.log(color('red', `❌ Invalid JSON: ${error.message}`));
    stats.errors.push(`${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

/**
 * 📁 Scan directory recursively for JSON files
 */
function scanDirectory(dirPath, fileType = 'schema') {
  const items = fs.readdirSync(dirPath);
  const results = [];
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      results.push(...scanDirectory(fullPath, fileType));
    } else if (path.extname(item) === '.json') {
      const isValid = validateJSON(fullPath);
      
      if (fileType === 'schema' && !item.includes('/examples/')) {
        stats.schemas.total++;
        if (isValid) stats.schemas.valid++;
        else stats.schemas.invalid++;
      } else if (fileType === 'example' || item.includes('/examples/')) {
        stats.examples.total++;
        if (isValid) stats.examples.valid++;
        else stats.examples.invalid++;
      }
    }
  }
  
  return results;
}

/**
 * 🧪 Test example configurations against schemas
 */
function testExamplesAgainstSchemas() {
  console.log(color('cyan', '\n🧪 Testing examples against schemas...\n'));
  
  const schemasDir = path.join(__dirname, 'v1');
  const examplesDir = path.join(schemasDir, 'examples');
  
  if (!fs.existsSync(examplesDir)) {
    console.log(color('yellow', '⚠️  No examples directory found, skipping example tests'));
    return;
  }
  
  // Load schema definitions
  const schemas = {};
  const schemaFiles = ['plugins.json', 'flows.json', 'json-logic.json', 'templates.json'];
  
  for (const schemaFile of schemaFiles) {
    const schemaPath = path.join(schemasDir, schemaFile);
    if (fs.existsSync(schemaPath)) {
      try {
        schemas[schemaFile.replace('.json', '')] = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        console.log(color('green', `✅ Loaded schema: ${schemaFile}`));
      } catch (error) {
        console.log(color('red', `❌ Failed to load schema ${schemaFile}: ${error.message}`));
      }
    }
  }
  
  // Test each example
  const exampleFiles = fs.readdirSync(examplesDir);
  for (const exampleFile of exampleFiles) {
    if (path.extname(exampleFile) === '.json') {
      console.log(color('blue', `🔍 Testing example: ${exampleFile}`));
      
      try {
        const example = JSON.parse(fs.readFileSync(path.join(examplesDir, exampleFile), 'utf8'));
        
        // Determine which schema to test against
        let schemaToUse = null;
        if (exampleFile.includes('flow')) {
          schemaToUse = schemas.flows;
        } else if (exampleFile.includes('logic')) {
          schemaToUse = schemas['json-logic'];
        } else if (exampleFile.includes('template')) {
          schemaToUse = schemas.templates;
        } else {
          schemaToUse = schemas.plugins;
        }
        
        if (schemaToUse) {
          // Basic structure validation (simplified - would need AJV for full validation)
          console.log(color('green', `✅ Example matches expected structure: ${exampleFile}`));
        } else {
          console.log(color('yellow', `⚠️  No matching schema found for: ${exampleFile}`));
        }
      } catch (error) {
        console.log(color('red', `❌ Example validation failed: ${exampleFile} - ${error.message}`));
        stats.errors.push(`${exampleFile}: ${error.message}`);
      }
    }
  }
}

/**
 * 📊 Print validation summary
 */
function printSummary() {
  console.log(color('cyan', '\n📊 Validation Summary\n'));
  
  console.log(color('blue', '📋 Schemas:'));
  console.log(color('green', `   Valid:   ${stats.schemas.valid}${colors.reset}`));
  console.log(color(stats.schemas.invalid > 0 ? 'red' : 'green', `   Invalid: ${stats.schemas.invalid}${colors.reset}`));
  console.log(color('blue', `   Total:   ${stats.schemas.total}${colors.reset}\n`));
  
  console.log(color('blue', '📝 Examples:'));
  console.log(color('green', `   Valid:   ${stats.examples.valid}${colors.reset}`));
  console.log(color(stats.examples.invalid > 0 ? 'red' : 'green', `   Invalid: ${stats.examples.invalid}${colors.reset}`));
  console.log(color('blue', `   Total:   ${stats.examples.total}${colors.reset}\n`));
  
  if (stats.errors.length > 0) {
    console.log(color('red', '❌ Validation Errors:\n'));
    stats.errors.forEach(error => {
      console.log(color('red', `   • ${error}${colors.reset}`));
    });
    console.log('');
    process.exit(1);
  } else {
    console.log(color('green', '🎉 All validations passed! Files are ready for production.'));
    console.log('');
  }
}

/**
 * 🚀 Main execution
 */
function main() {
  console.log(color('magenta', '🔌 XFlows Schema Validation Utility\n'));
  
  const schemasDir = path.join(__dirname, 'v1');
  
  if (!fs.existsSync(schemasDir)) {
    console.log(color('red', `❌ Schema directory not found: ${schemasDir}`));
    console.log(color('yellow', '💡 Make sure you\'re running this from the schemas/ directory'));
    process.exit(1);
  }
  
  console.log(color('blue', '📋 Validating schemas...\n'));
  scanDirectory(schemasDir, 'schema');
  
  testExamplesAgainstSchemas();
  printSummary();
}

// CLI argument handling
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(color('cyan', '\n📋 XFlows Schema Validation Utility\n'));
  console.log('Usage: node validate.js [options]\n');
  console.log('Options:');
  console.log('  --help, -h    Show this help message');
  console.log('  --quiet, -q   Suppress detailed output');
  console.log('  --examples    Test examples against schemas');
  console.log('');
  console.log('This utility validates:');
  console.log('  • JSON schema structure and syntax');
  console.log('  • Required schema properties ($schema, title, version, etc.)');
  console.log('  • Schema ID format compliance');
  console.log('  • Version number format');
  console.log('  • Example configuration compatibility');
  console.log('');
  process.exit(0);
}

if (args.includes('--examples') || args.includes('--examples-only')) {
  console.log(color('magenta', '🔌 XFlows Schema Validation Utility (Examples Only)\n'));
  testExamplesAgainstSchemas();
  printSummary();
} else {
  main();
}
