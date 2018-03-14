/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscriptionQuery
 * @typechecks
 * 
 */

'use strict';

/**
 * @internal
 *
 * Constructs query fragments that are sent with subscriptions, which should ensure
 * that records are added and any records changed as a result of subscriptions are
 * brought up-to-date.
 */

var RelaySubscriptionQuery = {
  /**
   * Takes an AST node for a subscription and creates a RelayQuery.Subscription.
   */
  buildQuery: function buildQuery(_ref) {
    var configs = _ref.configs,
        input = _ref.input,
        subscription = _ref.subscription;

    return require('./RelayQuery').Subscription.create(subscription, require('./RelayMetaRoute').get('$RelaySubscriptionObserver'), { input: input });
  }
};

module.exports = RelaySubscriptionQuery;