/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionObservable
 * 
 */

'use strict';

var _classCallCheck3 = _interopRequireDefault(require('babel-runtime/helpers/classCallCheck'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * An Rx Observable representing the results of a RelaySubscription.
 * Subscribers are notified as follows:
 *
 * `onNext`: Called with the latest results of a RelaySubscription. Results will be of type SubscriptionResult.
 * `Relay.Store.NetworkLayer.sendSubscription`
 * - Called synchronously on first `subscribe()`.
 * - Called whenever the results of the RelaySubscription are received.
 *
 * `onError`: Called if the RelaySubscription gets an error and no more results will be received.
 *
 * `onCompleted`: Called when the RelaySubscription has completed successfully and no more results will be recieved.
 *
 * @see http://reactivex.io/documentation/observable.html
 */
var RelaySubscriptionObservable = function () {
  function RelaySubscriptionObservable(observer, storeData, subscription) {
    (0, _classCallCheck3['default'])(this, RelaySubscriptionObservable);

    this._variables = null;
    this._observer = observer;
    this._storeData = storeData;
    this._subscription = subscription;
    this._subscriptionCallbacks = [];
    this._subscriptionCallName = null;
    this._subscriptionConfigs = null;
    this._subscriptionCount = 0;
    this._subscriptionDisposable = null;
    this._subscriptionNode = null;
    this._subscriptionQuery = null;
  }

  /**
   * Get relay subscription
   */


  RelaySubscriptionObservable.prototype.getSubscription = function getSubscription() {
    return this._subscription;
  };

  /**
   * Subscribe to the subscription
   */


  RelaySubscriptionObservable.prototype.subscribe = function subscribe(callbacks) {
    var _this = this;

    this._subscriptionCount++;
    var subscriptionIndex = this._subscriptionCallbacks.length;
    this._subscriptionCallbacks.push(callbacks);
    var subscribeDisposable = {
      dispose: function dispose() {
        require('fbjs/lib/invariant')(_this._subscriptionCallbacks[subscriptionIndex], 'RelayQueryResultObservable: Subscriptions may only be disposed once.');
        delete _this._subscriptionCallbacks[subscriptionIndex];
        _this._subscriptionCount--;
        if (_this._subscriptionCount === 0) {
          _this._observer.unobserve(_this._subscription);
        }
      }
    };

    if (this._subscriptionCount === 1) {
      this._observe();
    }

    return subscribeDisposable;
  };

  /**
   * Dispose underlying RelaySubscription subscription
   */


  RelaySubscriptionObservable.prototype.unobserve = function unobserve() {
    if (this._subscriptionDisposable) {
      this._subscriptionDisposable.dispose();
      this._subscriptionDisposable = null;
    }
  };

  /**
   * Get subscription node call name and caches it.
   */


  RelaySubscriptionObservable.prototype._getCallName = function _getCallName() {
    if (!this._subscriptionCallName) {
      this._subscriptionCallName = this._getSubscriptionNode().calls[0].name;
    }
    return this._subscriptionCallName;
  };

  /**
   * Get subscription configs and caches it.
   */


  RelaySubscriptionObservable.prototype._getConfigs = function _getConfigs() {
    if (!this._subscriptionConfigs) {
      this._subscriptionConfigs = this._subscription.getConfigs();
    }
    return this._subscriptionConfigs;
  };

  /**
   * Gets the built subscription query and caches it.
   */


  RelaySubscriptionObservable.prototype._getQuery = function _getQuery() {
    if (!this._subscriptionQuery) {
      var subscriptionQuery = require('./RelaySubscriptionQuery').buildQuery({
        configs: this._getConfigs(),
        subscription: this._getSubscriptionNode(),
        input: this._getVariables()
      });
      this._subscriptionQuery = subscriptionQuery;
    }
    return this._subscriptionQuery;
  };

  /**
   * Gets the built subscription query and caches it.
   */


  RelaySubscriptionObservable.prototype._getSubscriptionNode = function _getSubscriptionNode() {
    if (!this._subscriptionNode) {
      var subscriptionNode = require('./QueryBuilder').getSubscription(this._subscription.getSubscription());
      require('fbjs/lib/invariant')(subscriptionNode, 'RelaySubscriptionObservable: Expected `getSubscription` to return a subscription created ' + 'with Relay.QL`subscription { ... }`.');
      this._subscriptionNode = subscriptionNode;
    }
    return this._subscriptionNode;
  };

  /**
   * Get subscripton input variable and caches it.
   */


  RelaySubscriptionObservable.prototype._getVariables = function _getVariables() {
    if (!this._variables) {
      this._variables = this._subscription.getVariables();
    }
    return this._variables;
  };

  /**
   * Send RelaySubscription and setup callbacks
   */


  RelaySubscriptionObservable.prototype._observe = function _observe() {
    var subscriptionRequest = new (require('./RelaySubscriptionRequest'))(this._getQuery(), {
      onCompleted: this._onCompleted.bind(this),
      onError: this._onError.bind(this),
      onNext: this._onNext.bind(this)
    });
    this._subscriptionDisposable = this._storeData.getNetworkLayer().sendSubscription(subscriptionRequest);
  };

  /**
   * Handle RelaySubscription completed
   */


  RelaySubscriptionObservable.prototype._onCompleted = function _onCompleted() {
    this._subscriptionCallbacks.forEach(function (callbacks) {
      return callbacks.onCompleted && callbacks.onCompleted();
    });
  };

  /**
   * Handle next RelaySubscription SubscriptionResult
   */


  RelaySubscriptionObservable.prototype._onError = function _onError(error) {
    this._subscriptionCallbacks.forEach(function (callbacks) {
      return callbacks.onError && callbacks.onError(error);
    });
  };

  /**
   * Handle RelaySubscription Error
   */


  RelaySubscriptionObservable.prototype._onNext = function _onNext(response) {
    this._storeData.handleUpdatePayload(this._getQuery(), response[this._getCallName()], {
      configs: this._getConfigs(),
      isOptimisticUpdate: false
    });
    this._subscriptionCallbacks.forEach(function (callbacks) {
      return callbacks.onNext && callbacks.onNext(response);
    });
  };

  return RelaySubscriptionObservable;
}();

module.exports = RelaySubscriptionObservable;