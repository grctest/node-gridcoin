
const gridcoin = require('./lib');

const client = new gridcoin.Client({
  host: 'localhost',
  port: 15715,
  user: 'rpc_user',
  pass: 'rpc_password'
});

(async () => {
  try {
    const latestBlock = await client.cmd('getblockcount');
    console.log('Latest Block:', latestBlock);

    const blockDetails = await client.cmd('getblockbynumber', latestBlock);
    console.log('Block Details:', blockDetails);
  } catch (err) {
    console.error(err);
  }
})();
