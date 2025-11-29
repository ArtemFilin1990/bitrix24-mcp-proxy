import SwaggerParser from '@apidevtools/swagger-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, '..', 'openapi.json');

async function main() {
  try {
    await SwaggerParser.validate(schemaPath);
    console.log('OpenAPI schema is valid');
  } catch (error) {
    console.error('OpenAPI validation failed:', error);
    process.exit(1);
  }
}

main();
