import { execSync } from 'child_process';

try {
  // Use tsx to compile and run a test
  const result = execSync('npx tsx -e "import * as auth from \'./server/replitAuth.ts\'; console.log(JSON.stringify(Object.keys(auth)))"', { encoding: 'utf8' });
  console.log('Auth exports:', result.trim());
} catch (error) {
  console.error('Error testing auth:', error.message);
}
