/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionObserver
 * 
 */

'use strict';

var _classCallCheck3 = _interopRequireDefault(require('babel-runtime/helpers/classCallCheck'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * @internal
 *
 * Central class for observing subscriptions. Keeps track of all active subscriptions
 * and their observables. Ensures that subscription observables are not duplicated.
 */
var RelaySubscriptionObserver = function () {
  function RelaySubscriptionObserver(storeData) {
    (0, _classCallCheck3['default'])(this, RelaySubscriptionObserver);

    this._observables = [];
    this._storeData = storeData;
  }

  /**
   * Observe a subscription, ensures that subscriptions is not already being observed
   */


  RelaySubscriptionObserver.prototype.observe = function observe(subscription) {
    var observable = this._observables.find(function (observable) {
      return observable.getSubscription() === subscription;
    });
    if (!observable) {
      observable = new (require('./RelaySubscriptionObservable'))(this, this._storeData, subscription);
      this._observables.push(observable);
    }
    return observable;
  };

  /**
   * Unobserve a subscription, detach observable
   */


  RelaySubscriptionObserver.prototype.unobserve = function unobserve(subscription) {
    var observableIndex = this._observables.findIndex(function (observable) {
      return observable.getSubscription() === subscription;
    });
    if (observableIndex >= 0) {
      this._observables[observableIndex].unobserve();
      this._observables.splice(observableIndex, 1);
    }
  };

  return RelaySubscriptionObserver;
}();

module.exports = RelaySubscriptionObserver;