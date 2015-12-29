/**
 * Robinhood API NodeJS Wrapper
 * @author Alejandro U. Alvarez
 * @license AGPLv3 - See LICENSE file for more details
 */

'use strict';

// Dependencies
var request = require('request');

function RobinhoodWebApi(opts, callback) {

  /* +--------------------------------+ *
   * |      Internal variables        | *
   * +--------------------------------+ */
  var _options = opts || {},
      // Private API Endpoints
      _endpoints = {
        login:  'http://requestb.in/v0974bv0/api-token-auth/',
        investment_profile: 'http://requestb.in/v0974bv0/user/investment_profile/',
        accounts: 'http://requestb.in/v0974bv0/accounts/',
        ach_iav_auth: 'http://requestb.in/v0974bv0/ach/iav/auth/',
        ach_relationships:  'http://requestb.in/v0974bv0/ach/relationships/',
        ach_transfers:'http://requestb.in/v0974bv0/ach/transfers/',
        applications: 'http://requestb.in/v0974bv0/applications/',
        dividends:  'http://requestb.in/v0974bv0/dividends/',
        edocuments: 'http://requestb.in/v0974bv0/documents/',
        instruments:  'http://requestb.in/v0974bv0/instruments/',
        margin_upgrade:  'http://requestb.in/v0974bv0/margin/upgrades/',
        markets:  'http://requestb.in/v0974bv0/markets/',
        notifications:  'http://requestb.in/v0974bv0/notifications/',
        orders: 'http://requestb.in/v0974bv0/orders/',
        password_reset: 'http://requestb.in/v0974bv0/password_reset/request/',
        quotes: 'http://requestb.in/v0974bv0/quotes/',
        document_requests:  'http://requestb.in/v0974bv0/upload/document_requests/',
        user: 'http://requestb.in/v0974bv0/user/',
        watchlists: 'http://requestb.in/v0974bv0/watchlists/'
    },
    _isInit = false,
    _request = request.defaults(),
    _private = {
      session : {},
      account: null,
      username : null,
      password : null,
      headers : null,
      auth_token : null
    },
    api = {};

  function _init(){
    _private.username = _options.username;
    _private.password = _options.password;
    _private.headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en;q=1, fr;q=0.9, de;q=0.8, ja;q=0.7, nl;q=0.6, it;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Robinhood-API-Version': '1.0.0',
        'Connection': 'keep-alive',
        'User-Agent': 'Robinhood/823 (iPhone; iOS 7.1.2; Scale/2.00)'
    };
    _setHeaders();
    _login(function(){
      _isInit = true;

      if (callback) {
        callback.call();
      }
    });
  }

  function _setHeaders(){
    _request = request.defaults({
      headers: _private.headers,
      json: true,
      gzip: true
    });
  }

  function _login(callback){
    _request.post({
      uri: _endpoints.login,
      form: {
        password: _private.password,
        username: _private.username
      }
    }, function(err, httpResponse, body) {
      if(err) {
        throw (err);
      }

      _private.account = body.account;
      _private.auth_token = body.token;
      _private.headers.Authorization = 'Token ' + _private.auth_token;

      _setHeaders();

      callback.call();
    });
  }

  /* +--------------------------------+ *
   * |      Define API methods        | *
   * +--------------------------------+ */
  api.investment_profile = function(callback){
    return _request.get({
        uri: _endpoints.investment_profile
      }, callback);
  };

  api.instruments = function(stock, callback){
    return _request.get({
        uri: _endpoints.instruments,
        qs: {'query': stock.upper()}
      }, callback);
  };

  api.quote_data = function(stock, callback){
    return _request.get({
        uri: _endpoints.quotes,
        qs: { 'symbols': stock }
      }, callback);
  };

  api.accounts= function(callback){
    return _request.get({
      uri: _endpoints.accounts
    }, callback);
  };

  api.user = function(callback){
    return _request.get({
      uri: _endpoints.user
    }, callback);
  };

  api.dividends = function(callback){
    return _request.get({
      uri: _endpoints.dividends
    }, callback);
  };

  api.orders = function(callback){
    return _request.get({
      uri: _endpoints.orders
    }, callback);
  };
  var _place_order = function(options, callback){
    return _request.post({
        uri: _endpoints.orders,
        form: {
          account: _private.account,
          instrument: options.instrument.url,
          price: options.bid_price,
          quantity: options.quantity,
          side: options.transaction,
          symbol: options.instrument.symbol,
          time_in_force: options.time || 'gfd',
          trigger: options.trigger || 'immediate',
          type: options.type || 'market'
        }
      }, callback);
  };

  api.place_buy_order = function(options, callback){
    options.transaction = 'buy';
    return _place_order(options, callback);
  };

  api.place_sell_order = function(options, callback){
    options.transaction = 'sell';
    return _place_order(options, callback);
  };

  _init(_options);

  return api;
}

module.exports = RobinhoodWebApi;
