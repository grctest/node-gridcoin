const commands = require('./gridcoin_api');
const commandsDeprecated = require('./commands_deprecated');
const rpc = require('./jsonrpc');

class Client {
  constructor(opts) {
    this.rpc = new rpc.Client(opts);
    this.initializeWrappers();
  }

  async cmd(cmd, ...args) {
    try {
      const result = await this.callRpc(cmd, args);
      return result;
    } catch (err) {
      console.error(`Error executing command ${cmd}:`, err);
      throw err;
    }
  }

  async callRpc(cmd, args) {
    try {
      const result = await this.rpc.call(cmd, args);
      return result;
    } catch (err) {
      console.error(`Error calling RPC method ${cmd}:`, err);
      throw err;
    }
  }

  initializeWrappers() {
    const getWrapper = (protoFn, deprecated) => {
      const command = deprecated ? commandsDeprecated[protoFn] : commands[protoFn];
      return async (...args) => {
        if (deprecated) {
          deprecate(`${protoFn} is deprecated`);
        }
        return await this.callRpc(command, args);
      };
    };

    for (const protoFn in commands) {
      this[protoFn] = getWrapper(protoFn, false);
    }

    for (const protoFn in commandsDeprecated) {
      this[protoFn] = getWrapper(protoFn, true);
    }
  }
}

module.exports.Client = Client;