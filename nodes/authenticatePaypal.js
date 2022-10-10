const Support = require('./support');

module.exports = function (RED) {
  function AuthenticatePayPalNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    const flowContext = node.context().flow;

    flowContext.set(`_YOU_ApiPayPal_${node.id}`, {
      credentials: {
        ClientID: node.credentials.clientId,
        ClientSecret: node.credentials.clientSecret,
      },
    });

    if (!node.credentials.clientId || !node.credentials.clientSecret) {
      node.status({ fill: 'gray', shape: 'ring', text: 'Missing credentials' });
    }

    node.on('input', async (msg, send, done) => {
      node.status({});

      if (!node.credentials.clientId || !node.credentials.clientSecret) {
        node.status({ fill: 'red', shape: 'dot', text: 'Missing credentials' });
        done(new Error('Missing credentials'));
        return;
      }

      // const headers = flowContext.get(`_YOU_ApiPayPal_${node.id}.headers`);

      msg._YOU_ApiPayPal = {
        idAuth: node.id,
      };

      // if (!headers) {
        try {
          const result = await Support.login(node, node.id);
          flowContext.set(`_YOU_ApiPayPal_${node.id}.token`, result.data.access_token);
        } catch (error) {
          msg.payload = error;
          if (error.response && error.response.data) {
            msg.statusCode = error.response.status;
            msg.payload = error.response.data;
          }
          node.send(msg);
          node.status({ fill: 'red', shape: 'dot', text: 'disconnected' });
          done(error);
          return;
        }
      // }
      node.send(msg);
      node.status({ fill: 'green', shape: 'dot', text: 'connected' });
    });
  }
  
  RED.nodes.registerType('authenticatePaypal', AuthenticatePayPalNode, {
    credentials: {
      clientId: { type: 'text' },
      clientSecret: { type: 'password' }
    },
  });
};
