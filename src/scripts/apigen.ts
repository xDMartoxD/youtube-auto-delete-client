import { createClient } from '@hey-api/openapi-ts';

try {
  await createClient({
    clientName: '@hey-api/client-fetch',
    input: '../backend/openapi.json',
    output: './src/api',
  });
} catch (error) {
  console.error(error);
}
