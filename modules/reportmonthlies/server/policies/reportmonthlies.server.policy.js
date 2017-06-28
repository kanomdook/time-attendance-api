'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Reportmonthlies Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/reportmonthlies',
      permissions: '*'
    }, {
      resources: '/api/reportmonthlies/:reportmonthlyId',
      permissions: '*'
    }, {
      resources: '/api/reportmonthly/:date/:employeeid',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/reportmonthlies',
      permissions: ['get', 'post']
    }, {
      resources: '/api/reportmonthlies/:reportmonthlyId',
      permissions: ['get']
    }, {
      resources: '/api/reportmonthly/:date/:employeeid',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/reportmonthlies',
      permissions: ['get']
    }, {
      resources: '/api/reportmonthlies/:reportmonthlyId',
      permissions: ['get']
    }, {
      resources: '/api/reportmonthly/:date/:employeeid',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Reportmonthlies Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Reportmonthly is being processed and the current user created it then allow any manipulation
  if (req.reportmonthly && req.user && req.reportmonthly.user && req.reportmonthly.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
