async function check(url) {
  try {
    const res = await fetch(url);
    console.log(`[SUCCESS] ${url} -> status: ${res.status}`);
  } catch (e) {
    console.log(`[FAILED] ${url} -> error: ${e.message}`);
  }
}

async function run() {
  console.log('Checking local dev endpoints...');
  await check('http://localhost:3000');
  await check('http://localhost:3002');
  await check('http://localhost:5000/health');
}

run();
