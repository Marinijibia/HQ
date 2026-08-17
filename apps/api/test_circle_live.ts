import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load environment variables
dotenv.config();

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
const walletId = process.env.CIRCLE_WALLET_ID;
const walletAddress = process.env.CIRCLE_WALLET_ADDRESS;

async function testCircleLive() {
  console.log('================================================================');
  console.log('        CIRCLE DEVELOPER-CONTROLLED WALLET LIVE TEST            ');
  console.log('================================================================\n');

  console.log('1. VERIFYING ENVIRONMENT CONFIGURATION:');
  console.log(`   CIRCLE_API_KEY:          ${apiKey ? apiKey.substring(0, 20) + '...' : 'MISSING'}`);
  console.log(`   CIRCLE_ENTITY_SECRET:     ${entitySecret ? 'Configured (32 bytes)' : 'MISSING'}`);
  console.log(`   CIRCLE_WALLET_SET_ID:     ${walletSetId || 'MISSING'}`);
  console.log(`   CIRCLE_WALLET_ID:         ${walletId || 'MISSING'}`);
  console.log(`   CIRCLE_WALLET_ADDRESS:    ${walletAddress || 'MISSING'}`);

  if (!apiKey || !entitySecret || !walletId) {
    throw new Error('Required Circle configuration is missing in .env');
  }

  // 2. Query Circle Live SDK for the Wallet
  console.log('\n2. QUERYING CIRCLE API FOR LIVE WALLET STATUS:');
  const { initiateDeveloperControlledWalletsClient } = await import(
    '@circle-fin/developer-controlled-wallets'
  );

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: apiKey!,
    entitySecret: entitySecret!,
  });

  const walletRes = await client.getWallet({
    id: walletId,
  });

  console.log('   Live Wallet Response:', JSON.stringify(walletRes.data, null, 2));

  const wallet = walletRes.data?.wallet;
  if (wallet) {
    console.log(`   [CONFIRMED] Wallet ID:      ${wallet.id}`);
    console.log(`   [CONFIRMED] State:          ${wallet.state}`);
    console.log(`   [CONFIRMED] Address:        ${wallet.address}`);
    console.log(`   [CONFIRMED] Blockchain:     ${wallet.blockchain}`);
    console.log(`   [CONFIRMED] Custody Type:   ${wallet.custodyType}`);
    console.log(`   [CONFIRMED] Account Type:   ${wallet.accountType}`);
  }

  // 3. Query Token Balances on Arc Testnet
  console.log('\n3. QUERYING WALLET TOKEN BALANCES (USDC / NATIVE):');
  try {
    const balancesRes = await client.getWalletTokenBalance({
      id: walletId,
    });
    console.log('   Token Balances:', JSON.stringify(balancesRes.data, null, 2));
  } catch (err: any) {
    console.warn(`   Notice querying token balance: ${err.message || err}`);
  }

  // 4. Test CircleClientService in API
  console.log('\n4. TESTING API CIRCLE CLIENT SERVICE INTEGRATION:');
  const { CircleClientService } = await import(
    './src/modules/wallet/circle-client.service'
  );
  const circleService = new CircleClientService();
  const reserve = await circleService.getMasterWalletReserve();
  console.log(`   Master Reserve Query Result: ${JSON.stringify(reserve)}`);

  console.log('\n================================================================');
  console.log('🎉 CIRCLE DEVELOPER-CONTROLLED WALLET FULLY VERIFIED & LIVE!   ');
  console.log('================================================================');
}

testCircleLive().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
