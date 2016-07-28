/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionRequest
 * 
 */

'use strict';

var _classCallCheck3 = _interopRequireDefault(require('babel-runtime/helpers/classCallCheck'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendSubscription`.
 */
var RelaySubscriptionRequest = function () {
  function RelaySubscriptionRequest(subscription, callbacks) {
    (0, _classCallCheck3['default'])(this, RelaySubscriptionRequest);

    this._subscription = subscription;
    this._callbacks = callbacks;
  }

  /**
   * @public
   *
   * Gets a string name used to refer to this request for printing debug output.
   */


  RelaySubscriptionRequest.prototype.getDebugName = function getDebugName() {
    return this._subscription.getName();
  };

  /**
   * @public
   *
   * Gets the variables used by the subscription. These variables should be
   * serialized and sent in the GraphQL request.
   */


  RelaySubscriptionRequest.prototype.getVariables = function getVariables() {
    return this._getPrintedQuery().variables;
  };

  /**
   * @public
   *
   * Gets a string representation of the GraphQL subscription.
   */


  RelaySubscriptionRequest.prototype.getQueryString = function getQueryString() {
    return this._getPrintedQuery().text;
  };

  /**
   * @public
   * @unstable
   */


  RelaySubscriptionRequest.prototype.getSubscription = function getSubscription() {
    return this._subscription;
  };

  /**
   * @public
   * @unstable
   */


  RelaySubscriptionRequest.prototype.onCompleted = function onCompleted() {
    return this._callbacks && this._callbacks.onCompleted();
  };

  /**
   * @public
   * @unstable
   */


  RelaySubscriptionRequest.prototype.onNext = function onNext(payload) {
    return this._callbacks && this._callbacks.onNext(payload);
  };

  /**
   * @public
   * @unstable
   */


  RelaySubscriptionRequest.prototype.onError = function onError(error) {
    return this._callbacks && this._callbacks.onError(error);
  };

  /**
   * @private
   *
   * Returns the memoized printed query.
   */


  RelaySubscriptionRequest.prototype._getPrintedQuery = function _getPrintedQuery() {
    if (!this._printedQuery) {
      this._printedQuery = require('./printRelayQuery')(this._subscription);
    }
    return this._printedQuery;
  };

  return RelaySubscriptionRequest;
}();

module.exports = RelaySubscriptionRequest;