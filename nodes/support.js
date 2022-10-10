const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

async function sendRequest(node, msg, config, resourceAction) {
  const flowContext = node.context().flow;
  const token = flowContext.get(`_YOU_ApiPayPal_${msg._YOU_ApiPayPal.idAuth}.token`);
  let headers = {
    Authorization: `Bearer ${token}`
  };

  let url = resourceAction.endpoint;
  resourceAction.pathParams.forEach(param => {
    url = url.replace(`{${param}}`, (config[`${param}Type`] == 'str') ? config[param] : msg[config[param]]);
  });

  if (resourceAction.queryParams) {
    if (config.queryParams) {
      url = url + '?';
      for (const [key, value] of Object.entries(msg[config.queryParams])) {
        url = url + `${key}=${value}&`;
      }
    }
  }

  let data = {};
  if (resourceAction.bodyParams) {
    data = msg[config.bodyParams]
  }


  let form = new FormData();
  if (resourceAction.formParams) {
    form.append('input', JSON.stringify(msg[config.bodyParams]), {
      contentType: 'application/json',
    });
    
    if (msg[config.formParams]) {
      form.append('file1', Readable.from(msg[config.formParams]), {
        filename: (config.filenameType == 'str') ? config.filename : msg[config.filename],
      });
    }
      
    headers = {
      ...headers,
      'Content-Type': 'multipart/related',
    }
  }

  const options = {
    method: resourceAction.method,
    url: url,
    data: form || data,
    headers: headers
  };
      
  try {
    return await axios(options);
  } catch (error) {
    if (error.response.status == 401) {
      await login(node, msg._YOU_ApiPayPal.idAuth);

      try {
        return await axios(options);
      } catch (error) {
        throw error;
      }
    }

    if (error.response && error.response.data) {
      msg.statusCode = error.response.status;
      msg.payload = error.response.data;
      msg.requestUrl = url;
      node.send(msg);
      throw new Error(JSON.stringify(error.response.data));
    }

    throw error;
  }
}

async function login(node, idAuth) {
  const flowContext = node.context().flow;

  // Sandbox endpoint
  const url = 'https://api-m.sandbox.paypal.com/v1/oauth2/token?grant_type=client_credentials';
  // Live endpoint
  // const url = 'https://api-m.paypal.com/v1/oauth2/token?grant_type=client_credentials';

  const credentials = flowContext.get(`_YOU_ApiPayPal_${idAuth}.credentials`);

  const options = {
    method: 'POST',
    url: url,
    auth: {
      username: credentials.ClientID,
      password: credentials.ClientSecret
    }
  };

  return await axios(options);
}

module.exports = {
  login: login,
  sendRequest: sendRequest,
};
