import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// Load .env
dotenv.config();

const apiKey = process.env.CIRCLE_API_KEY;
if (!apiKey) {
  console.error('❌ Error: CIRCLE_API_KEY is required. Please set CIRCLE_API_KEY in your .env file.');
  process.exit(1);
}

async function registerSecret() {
  const envPath = path.resolve(process.cwd(), '.env');
  const existingEnv = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';

  if (/^CIRCLE_ENTITY_SECRET=/m.test(existingEnv)) {
    console.warn('⚠️ Warning: CIRCLE_ENTITY_SECRET already exists in .env. Skipping re-registration to prevent secret mismatch.');
    return;
  }

  // Dynamic import of @circle-fin/developer-controlled-wallets
  const { registerEntitySecretCiphertext } = await import(
    '@circle-fin/developer-controlled-wallets'
  );

  // Generate a cryptographically secure 32-byte (64 hex characters) entity secret
  const entitySecret = randomBytes(32).toString('hex');
  const recoveryFilePath = path.resolve(process.cwd(), 'recovery');
  mkdirSync(recoveryFilePath, { recursive: true });

  console.log('🔄 Registering Entity Secret with Circle API...');
  await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: recoveryFilePath,
  });

  appendFileSync(envPath, `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`);
  console.log('✅ Entity secret successfully registered with Circle!');
  console.log(`📁 Recovery file saved securely in: ${recoveryFilePath}`);
  console.log('🔑 CIRCLE_ENTITY_SECRET appended to .env');
}

registerSecret().catch((err) => {
  console.error('❌ Registration failed:', err.message || err);
  process.exit(1);
});
