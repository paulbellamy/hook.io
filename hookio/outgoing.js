/*
 * hookio/outgoing.js
 *
 * Handles and routes outgoing responses / requests
 */

var hookIO = require('../hookio').hookIO;
var sys = require('sys');

hookIO.addListener('Http404Response', function(request, response) {
  response.writeHeaders(404, {});
  response.write('Page not found.');
  response.close();
});

hookIO.addListener('JsonrpcResponse', function(response, jsonrpcData, result) {
  var data = {
    id: jsonrpcData.id,
    result: result,
    error: null
  };

  hookIO.emit('HttpResponse', response, {
    'Content-Type': 'application/json'
  }, data);
});

hookIO.addListener('Jsonrpc404Response', function(response, error, jsonrpcData) {
  var data = {
    id: jsonrpcData.id || new Date().getTime(),
    result: null,
    error: {
      message: error.message || 'API method not found'
    }
  };

  hookIO.emit('HttpResponse', response, {
    'Content-Type': 'application/json'
  }, data);
});

hookIO.addListener('HttpResponse', function(response, headers, body) {
  var responseHeaders = {};
  process.mixin(responseHeaders, hookIO.HTTP.defaultHeaders);
  process.mixin(responseHeaders, headers);

  // TODO: Parse XML automagically
  if ('string' !== typeof body) {
    if ('application/json' === responseHeaders['Content-Type'])
      body = JSON.stringify(body);
  }

  response.writeHeaders(200, headers);
  response.write(body);
  response.close();
});

hookIO.addListener('HttpClientRequest', function(options) {
  new hookIO.http.Client(options).close();
});
