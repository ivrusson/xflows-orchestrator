#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ 
  strict: true, 
  allErrors: true,
  verbose: true 
});
addFormats(ajv);

/**
 * Validate a flow JSON file against the schema
 * @param {string} flowPath - Path to flow JSON file
 */
function validateFlow(flowPath) {
  console.log(`🔍 Validating flow: ${flowPath}`);
  
  try {
    // Load schema
    const schemaPath = resolve(process.cwd(), 'schemas/v1/flows.json');
    const schemaData = readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaData);
    
    // Load flow
    const flowData = readFileSync(flowPath, 'utf-8');
    const flow = JSON.parse(flowData);
    
    // Validate
    const validate = ajv.compile(schema);
    const isValid = validate(flow);
    
    if (!isValid) {
      console.error('❌ JSON Schema validation failed');
      console.error('Validation errors:', validate.errors);
      process.exit(1);
    }
    
    console.log('✅ Flow validation passed');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// CLI usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const flowPath = process.argv[2];
  if (!flowPath) {
    console.error('Usage: node validate-flow.js <flow-path>');
    process.exit(1);
  }
  validateFlow(flowPath);
}

export { validateFlow };
