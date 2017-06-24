'use strict';

/**
 * Module dependencies
 */
var reportdailiesPolicy = require('../policies/reportdailies.server.policy'),
  reportdailies = require('../controllers/reportdailies.server.controller');

module.exports = function(app) {
  // Reportdailies Routes
  app.route('/api/reportdailies').all(reportdailiesPolicy.isAllowed)
    .get(reportdailies.list)
    .post(reportdailies.create);

  app.route('/api/reportdailies/:reportdailyId').all(reportdailiesPolicy.isAllowed)
    .get(reportdailies.read)
    .put(reportdailies.update)
    .delete(reportdailies.delete);

  // Finish by binding the Reportdaily middleware
  app.param('reportdailyId', reportdailies.reportdailyByID);
};
