/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscription
 * 
 */

'use strict';

var _extends3 = _interopRequireDefault(require('babel-runtime/helpers/extends'));

var _classCallCheck3 = _interopRequireDefault(require('babel-runtime/helpers/classCallCheck'));

var _keys2 = _interopRequireDefault(require('babel-runtime/core-js/object/keys'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * @public
 *
 * RelaySubscription is the base class for modeling subscriptions of data.
 */
var RelaySubscription = function () {
  function RelaySubscription(props) {
    (0, _classCallCheck3['default'])(this, RelaySubscription);

    this._didShowFakeDataWarning = false;
    this._didValidateConfig = false;
    this._unresolvedProps = props;
  }

  /**
   * @internal
   */


  RelaySubscription.prototype.bindEnvironment = function bindEnvironment(environment) {
    if (!this._environment) {
      this._environment = environment;
      this._resolveProps();
    } else {
      require('fbjs/lib/invariant')(environment === this._environment, '%s: Subscription instance cannot be used in different Relay environments.', this.constructor.name);
    }
  };

  /**
   * Each subscription corresponds to a field on the server which is used by clients
   * to communicate the type of subscription to be executed.
   */


  RelaySubscription.prototype.getSubscription = function getSubscription() {
    require('fbjs/lib/invariant')(false, '%s: Expected abstract method `getSubscription` to be implemented.', this.constructor.name);
  };

  /**
   * These configurations are used to generate the query for the subscription to be
   * sent to the server and to correctly write the server's response into the
   * client store.
   *
   * Possible configuration types:
   *
   * -  FIELDS_CHANGE provides configuration for subscription fields.
   *    {
   *      type: RelayMutationType.FIELDS_CHANGE;
   *      fieldIDs: {[fieldName: string]: DataID | Array<DataID>};
   *    }
   *    where fieldIDs map `fieldName`s from the fatQuery to a DataID or
   *    array of DataIDs to be updated in the store.
   *
   * -  RANGE_ADD provides configuration for adding a new edge to a range.
   *    {
   *      type: RelayMutationType.RANGE_ADD;
   *      parentName: string;
   *      parentID: string;
   *      connectionName: string;
   *      edgeName: string;
   *      rangeBehaviors:
   *        {[call: string]: GraphQLMutatorConstants.RANGE_OPERATIONS};
   *    }
   *    where `parentName` is the field in the fatQuery that contains the range,
   *    `parentID` is the DataID of `parentName` in the store, `connectionName`
   *    is the name of the range, `edgeName` is the name of the key in server
   *    response that contains the newly created edge, `rangeBehaviors` maps
   *    stringified representation of calls on the connection to
   *    GraphQLMutatorConstants.RANGE_OPERATIONS.
   *
   * -  NODE_DELETE provides configuration for deleting a node and the
   *    corresponding edge from a range.
   *    {
   *      type: RelayMutationType.NODE_DELETE;
   *      parentName: string;
   *      parentID: string;
   *      connectionName: string;
   *      deletedIDFieldName: string;
   *    }
   *    where `parentName`, `parentID` and `connectionName` refer to the same
   *    things as in RANGE_ADD, `deletedIDFieldName` is the name of the key in
   *    the server response that contains the DataID of the deleted node.
   *
   * -  RANGE_DELETE provides configuration for deleting an edge from a range
   *    but doesn't delete the node.
   *    {
   *      type: RelayMutationType.RANGE_DELETE;
   *      parentName: string;
   *      parentID: string;
   *      connectionName: string;
   *      deletedIDFieldName: string | Array<string>;
   *      pathToConnection: Array<string>;
   *    }
   *    where `parentName`, `parentID`, `connectionName` and
   *    `deletedIDFieldName` refer to the same things as in NODE_DELETE.
   *    `deletedIDFieldName` can also be a path from the response root to the
   *    deleted node. `pathToConnection` is a path from `parentName` to
   *    `connectionName`.
   *
   * -  REQUIRED_CHILDREN is used to append additional children (fragments or
   *    fields) to the subscription query. Any data fetched for these children is
   *    not written to the client store, but you can add code to process it
   *    in the `onSuccess` callback passed to the `RelayEnvironment` `applyUpdate`
   *    method. You may need to use this, for example, to fetch fields on a new
   *    object created by the subscription (and which Relay would normally not
   *    attempt to fetch because it has not previously fetched anything for that
   *    object).
   *    {
   *      type: RelayMutationType.REQUIRED_CHILDREN;
   *      children: Array<RelayQuery.Node>;
   *    }
   */


  RelaySubscription.prototype.getConfigs = function getConfigs() {
    require('fbjs/lib/invariant')(false, '%s: Expected abstract method `getConfigs` to be implemented.', this.constructor.name);
  };

  /**
   * These variables form the "input" to the subscription query sent to the server.
   */


  RelaySubscription.prototype.getVariables = function getVariables() {
    require('fbjs/lib/invariant')(false, '%s: Expected abstract method `getVariables` to be implemented.', this.constructor.name);
  };

  /**
   * An optional collision key allows a subscription to identify itself with other
   * subscriptions that affect the same fields. Subscriptions with the same collision
   * are sent to the server serially and in-order to avoid unpredictable and
   * potentially incorrect behavior.
   */


  RelaySubscription.prototype.getCollisionKey = function getCollisionKey() {
    return null;
  };

  RelaySubscription.prototype._resolveProps = function _resolveProps() {
    var _this = this;

    var fragments = this.constructor.fragments;
    var initialVariables = this.constructor.initialVariables || {};

    var props = this._unresolvedProps;
    var resolvedProps = (0, _extends3['default'])({}, props);
    require('fbjs/lib/forEachObject')(fragments, function (fragmentBuilder, fragmentName) {
      var propValue = props[fragmentName];
      require('fbjs/lib/warning')(propValue !== undefined, 'RelaySubscription: Expected data for fragment `%s` to be supplied to ' + '`%s` as a prop. Pass an explicit `null` if this is intentional.', fragmentName, _this.constructor.name);

      if (propValue == null) {
        return;
      }
      if (typeof propValue !== 'object') {
        require('fbjs/lib/warning')(false, 'RelaySubscription: Expected data for fragment `%s` supplied to `%s` ' + 'to be an object.', fragmentName, _this.constructor.name);
        return;
      }

      var fragment = require('./RelayQuery').Fragment.create(buildSubscriptionFragment(_this.constructor.name, fragmentName, fragmentBuilder, initialVariables), require('./RelayMetaRoute').get('$RelaySubscription_' + _this.constructor.name), initialVariables);

      if (fragment.isPlural()) {
        require('fbjs/lib/invariant')(Array.isArray(propValue), 'RelaySubscription: Invalid prop `%s` supplied to `%s`, expected an ' + 'array of records because the corresponding fragment is plural.', fragmentName, _this.constructor.name);
        var dataIDs = propValue.map(function (item, ii) {
          require('fbjs/lib/invariant')(typeof item === 'object' && item != null, 'RelaySubscription: Invalid prop `%s` supplied to `%s`, ' + 'expected element at index %s to have query data.', fragmentName, _this.constructor.name, ii);
          if (process.env.NODE_ENV !== 'production') {
            var hasFragmentData = require('./RelayFragmentPointer').hasFragment(item, fragment);
            if (!hasFragmentData && !_this._didShowFakeDataWarning) {
              _this._didShowFakeDataWarning = true;
              require('fbjs/lib/warning')(false, 'RelaySubscription: Expected prop `%s` element at index %s ' + 'supplied to `%s` to be data fetched by Relay. This is ' + 'likely an error unless you are purposely passing in mock ' + 'data that conforms to the shape of this mutation\'s fragment.', fragmentName, ii, _this.constructor.name);
            }
          }
          var dataID = require('./RelayRecord').getDataIDForObject(item);
          require('fbjs/lib/invariant')(dataID, 'RelaySubscription: Invalid prop `%s` supplied to `%s`, ' + 'expected element at index %s to have query data.', fragmentName, _this.constructor.name, ii);
          return dataID;
        });

        resolvedProps[fragmentName] = dataIDs.map(function (dataID) {
          return _this._environment.read(fragment, dataID);
        });
      } else {
        require('fbjs/lib/invariant')(!Array.isArray(propValue), 'RelaySubscription: Invalid prop `%s` supplied to `%s`, expected a ' + 'single record because the corresponding fragment is not plural.', fragmentName, _this.constructor.name);
        if (process.env.NODE_ENV !== 'production') {
          var hasFragmentData = require('./RelayFragmentPointer').hasFragment(propValue, fragment);
          if (!hasFragmentData && !_this._didShowFakeDataWarning) {
            _this._didShowFakeDataWarning = true;
            require('fbjs/lib/warning')(false, 'RelaySubscription: Expected prop `%s` supplied to `%s` to ' + 'be data fetched by Relay. This is likely an error unless ' + 'you are purposely passing in mock data that conforms to ' + 'the shape of this mutation\'s fragment.', fragmentName, _this.constructor.name);
          }
        }
        var dataID = require('./RelayRecord').getDataIDForObject(propValue);
        if (dataID) {
          resolvedProps[fragmentName] = _this._environment.read(fragment, dataID);
        }
      }
    });
    this.props = resolvedProps;

    if (!this._didValidateConfig) {
      this.getConfigs().forEach(function (config) {
        return require('./validateMutationConfig')(config, _this.constructor.name);
      });
      this._didValidateConfig = true;
    }
  };

  RelaySubscription.getFragment = function getFragment(fragmentName, variableMapping) {
    var _this2 = this;

    var fragments = this.fragments;
    var fragmentBuilder = fragments[fragmentName];
    if (!fragmentBuilder) {
      require('fbjs/lib/invariant')(false, '%s.getFragment(): `%s` is not a valid fragment name. Available ' + 'fragments names: %s', this.name, fragmentName, (0, _keys2['default'])(fragments).map(function (name) {
        return '`' + name + '`';
      }).join(', '));
    }

    var initialVariables = this.initialVariables || {};
    var prepareVariables = this.prepareVariables;

    return require('./RelayFragmentReference').createForContainer(function () {
      return buildSubscriptionFragment(_this2.name, fragmentName, fragmentBuilder, initialVariables);
    }, initialVariables, variableMapping, prepareVariables);
  };

  return RelaySubscription;
}();

/**
 * Wrapper around `buildRQL.Fragment` with contextual error messages.
 */


function buildSubscriptionFragment(subscriptionName, fragmentName, fragmentBuilder, variables) {
  var fragment = require('./buildRQL').Fragment(fragmentBuilder, variables);
  require('fbjs/lib/invariant')(fragment, 'Relay.QL defined on subscription `%s` named `%s` is not a valid fragment. ' + 'A typical fragment is defined using: Relay.QL`fragment on Type {...}`', subscriptionName, fragmentName);
  return fragment;
}

module.exports = RelaySubscription;