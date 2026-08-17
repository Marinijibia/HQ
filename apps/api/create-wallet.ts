import * as dotenv from 'dotenv';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

// Load environment variables
dotenv.config();

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

if (!apiKey) {
  console.error('❌ Error: CIRCLE_API_KEY is required in .env');
  process.exit(1);
}

if (!entitySecret) {
  console.error('❌ Error: CIRCLE_ENTITY_SECRET is required in .env. Run register-entity-secret.ts first.');
  process.exit(1);
}

async function createDevControlledWallets() {
  const { initiateDeveloperControlledWalletsClient } = await import(
    '@circle-fin/developer-controlled-wallets'
  );

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: apiKey!,
    entitySecret: entitySecret!,
  });

  console.log('🔄 Creating Developer-Controlled Wallet Set...');
  const walletSetResponse = await client.createWalletSet({
    name: 'HQ AI OS Enterprise Treasury Set',
  });

  const walletSet = walletSetResponse.data?.walletSet;
  if (!walletSet?.id) {
    throw new Error('Wallet set creation failed: No ID returned from Circle API');
  }

  console.log('✅ Wallet Set Created:', walletSet.id);

  console.log('🔄 Creating Developer-Controlled Wallets (ARC-TESTNET & ETH-SEPOLIA)...');
  const walletResponse = await client.createWallets({
    walletSetId: walletSet.id,
    blockchains: ['ARC-TESTNET'],
    count: 1,
    accountType: 'EOA',
  });

  console.log('✅ Wallet Creation Response:', JSON.stringify(walletResponse.data, null, 2));

  const createdWallet = walletResponse.data?.wallets?.[0];
  if (createdWallet) {
    console.log('\n========================================================');
    console.log('🎉 CIRCLE WALLET READY FOR HQ AI AGENTIC TREASURY:');
    console.log(`   Wallet Set ID: ${walletSet.id}`);
    console.log(`   Wallet ID:     ${createdWallet.id}`);
    console.log(`   Address:       ${createdWallet.address}`);
    console.log(`   Blockchain:    ${createdWallet.blockchain}`);
    console.log('========================================================\n');

    // Save to .env if not already present
    const envPath = path.resolve(process.cwd(), '.env');
    const existingEnv = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
    let envAdditions = '';
    if (!existingEnv.includes('CIRCLE_WALLET_SET_ID=')) {
      envAdditions += `CIRCLE_WALLET_SET_ID=${walletSet.id}\n`;
    }
    if (!existingEnv.includes('CIRCLE_WALLET_ID=')) {
      envAdditions += `CIRCLE_WALLET_ID=${createdWallet.id}\n`;
    }
    if (!existingEnv.includes('CIRCLE_WALLET_ADDRESS=')) {
      envAdditions += `CIRCLE_WALLET_ADDRESS=${createdWallet.address}\n`;
    }

    if (envAdditions) {
      appendFileSync(envPath, `\n# Circle Treasury Wallets\n${envAdditions}`);
      console.log('💾 Wallet IDs appended to .env for automatic backend treasury binding!');
    }
  }
}

createDevControlledWallets().catch((err) => {
  console.error('❌ Wallet creation failed:', err.message || err);
  process.exit(1);
});
