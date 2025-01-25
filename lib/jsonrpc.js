const http = require('http');
const https = require('https');

class Client {
  constructor(opts = {}) {
    this.opts = opts;
    this.http = this.opts.ssl ? https : http;
  }

  async call(method, params, path = '/') {
    const time = Date.now();
    let requestJSON;

    if (Array.isArray(method)) {
      // multiple rpc batch call
      requestJSON = method.map((batchCall, i) => ({
        id: `${time}-${i}`,
        method: batchCall.method,
        params: batchCall.params,
      }));
    } else {
      // single rpc call
      requestJSON = {
        id: time,
        method,
        params,
      };
    }

    // Encode the request into JSON
    requestJSON = JSON.stringify(requestJSON);

    // Prepare request options
    const requestOptions = {
      host: this.opts.host,
      port: this.opts.port,
      method: 'POST',
      path: encodeURI(path),
      headers: {
        'Host': this.opts.host,
        'Content-Length': Buffer.byteLength(requestJSON),
      },
      agent: false,
      rejectUnauthorized: this.opts.ssl && this.opts.sslStrict !== false,
      timeout: 5000, // Add a timeout of 5 seconds
    };

    if (this.opts.ssl && this.opts.sslCa) {
      requestOptions.ca = this.opts.sslCa;
    }

    // Use HTTP auth if user and password set
    if (this.opts.user && this.opts.pass) {
      requestOptions.auth = `${encodeURIComponent(this.opts.user)}:${encodeURIComponent(this.opts.pass)}`;
    }

    // Make a request to the server
    return new Promise((resolve, reject) => {
      const request = this.http.request(requestOptions);

      request.on('error', reject);

      request.on('timeout', () => {
        request.abort();
        reject(new Error('Request timed out'));
      });

      request.on('response', (response) => {
        let buffer = '';
        response.on('data', (chunk) => {
          buffer += chunk;
        });

        response.on('end', () => {
          try {
            let decoded = JSON.parse(buffer);

            if (!Array.isArray(decoded)) {
              decoded = [decoded];
            }

            decoded.forEach((decodedResponse) => {
              if (decodedResponse.error) {
                const err = new Error(decodedResponse.error.message || '');
                if (decodedResponse.error.code) {
                  err.code = decodedResponse.error.code;
                }
                reject(err);
              } else if (decodedResponse.result) {
                resolve(decodedResponse.result);
              } else {
                const err = new Error('Unknown error');
                reject(err);
              }
            });
          } catch (e) {
            const err = new Error(
              response.statusCode !== 200
                ? `Invalid params, response status code: ${response.statusCode}`
                : 'Problem parsing JSON response from server'
            );
            err.code = response.statusCode !== 200 ? -32602 : -32603;
            reject(err);
          }
        });
      });

      request.end(requestJSON);
    });
  }
}

module.exports.Client = Client;