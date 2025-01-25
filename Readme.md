# node-gridcoin

node-gridcoin is a simple wrapper for the gridcoin client's JSON-RPC API.

## Install

`npm install https://github.com/grctest/node-gridcoin.git`

## Examples

### Create client

```js
var client = new gridcoin.Client({
  host: "localhost",
  port: 15715,
  user: "rpc_user",
  pass: "rpc_password",
});
```

### Get latest block

```js
const latestBlock = await client.cmd("getblockcount");
console.log("Latest Block:", latestBlock);
```

### Get block by number

```js
const blockDetails = await client.cmd("getblockbynumber", latestBlock);
console.log("Block Details:", blockDetails);
```

## SSL

See [Enabling SSL on original client](https://en.bitcoin.it/wiki/Enabling_SSL_on_original_client_daemon).

If you're using this to connect to gridcoinresearchd across a network it is highly
recommended to enable `ssl`, otherwise an attacker may intercept your RPC credentials
resulting in theft of your gridcoins.

When enabling `ssl` by setting the configuration option to `true`, the `sslStrict`
option (verifies the server certificate) will also be enabled by default. It is
highly recommended to specify the `sslCa` as well, even if your gridcoinresearchd has
a certificate signed by an actual CA, to ensure you are connecting
to your own gridcoinresearchd.

```js
var client = new gridcoin.Client({
  host: "localhost",
  port: 15715,
  user: "rpc_user",
  pass: "rpc_password",
  ssl: true,
  sslStrict: true,
  sslCa: fs.readFileSync(__dirname + "/server.cert"),
});
```

If your using a self signed certificate generated with something like

`openssl x509 -req -days 365 -in server.cert -signkey server.key -out server.cert`

then `sslStrict` should be set to `false` because by defult node wont work with
untrusted certificates.
