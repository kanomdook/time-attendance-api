'use strict';

/**
 * Module dependencies
 */
var reportsummarymonthliesPolicy = require('../policies/reportsummarymonthlies.server.policy'),
  reportsummarymonthlies = require('../controllers/reportsummarymonthlies.server.controller');

module.exports = function(app) {
  // Reportsummarymonthlies Routes
  app.route('/api/reportsummarymonthlies').all(reportsummarymonthliesPolicy.isAllowed)
    .get(reportsummarymonthlies.list)
    .post(reportsummarymonthlies.create);

  app.route('/api/reportsummarymonthlies/:reportsummarymonthlyId').all(reportsummarymonthliesPolicy.isAllowed)
    .get(reportsummarymonthlies.read)
    .put(reportsummarymonthlies.update)
    .delete(reportsummarymonthlies.delete);

  // Finish by binding the Reportsummarymonthly middleware
  app.param('reportsummarymonthlyId', reportsummarymonthlies.reportsummarymonthlyByID);
};
