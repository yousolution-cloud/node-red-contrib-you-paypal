const resources = require('../resources/resources.json');
const Support = require('./support');

module.exports = function (RED) {
  function ApiPayPalNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // reset status
    node.status({});

    node.on('input', async (msg, send, done) => {
      let resourceAction = {};

      resources[config.resourceName].forEach(action => {
        if (action.name == config.resource) {
          resourceAction = action;
        }
      });

      try {
        // Check required bodyParams
        if (resourceAction.bodyParams) {
          const data = msg[config.bodyParams];
          if (!data) {
            node.status({ fill: 'red', shape: 'dot', text: 'BodyParams must have value' });
            done(new Error('BodyParams must have value'));
            return;
          }
        }

        // Check required pathParams
        for (let param of resourceAction.pathParams) {
          const data = (config[`${param}Type`] == 'str') ? config[param] : msg[config[param]];
          if (!data) {
            node.status({ fill: 'red', shape: 'dot', text: 'Missing required param' });
            done(new Error('Missing required param'));
            return;
          }
        };

        // Check filename if formParams
        if (config.formParams) {
          const data = (config.filenameType == 'str') ? config.filename : msg[config.filename];
          if (!data) {
            node.status({ fill: 'red', shape: 'dot', text: 'Filename must have value' });
            done(new Error('Filename must have value'));
            return;
          }
        }

        const result = await Support.sendRequest(node, msg, config, resourceAction);

        msg.payload = result;
        msg.statusCode = result.status;
        node.status({ fill: 'green', shape: 'dot', text: 'success' });
        node.send(msg);
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: 'error' });
        done(error);
      }
    });
  }
   
  RED.httpAdmin.get('/resources', RED.auth.needsPermission('apyPaypal.read'), (req, res) => {
    res.json(resources);
  });

  RED.nodes.registerType('apiPaypal', ApiPayPalNode, {});
};
