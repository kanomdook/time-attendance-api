'use strict';

/**
 * Module dependencies
 */
var reportsummarymonthliesPolicy = require('../policies/reportsummarymonthlies.server.policy'),
  reportsummarymonthlies = require('../controllers/reportsummarymonthlies.server.controller');

module.exports = function (app) {
  // Reportsummarymonthlies Routes
  app.route('/api/reportsummarymonthlies').all(reportsummarymonthliesPolicy.isAllowed)
    .get(reportsummarymonthlies.list)
    .post(reportsummarymonthlies.create);

  app.route('/api/reportsummarymonthlies/:reportsummarymonthlyId').all(reportsummarymonthliesPolicy.isAllowed)
    .get(reportsummarymonthlies.read)
    .put(reportsummarymonthlies.update)
    .delete(reportsummarymonthlies.delete);

  // 
  app.route('/api/reportsummarymonthly/:startdate/:enddate').all(reportsummarymonthliesPolicy.isAllowed)
    .get(reportsummarymonthlies.reportsummarymonthlyByDate,reportsummarymonthlies.sendReport);

  // Finish by binding the Reportsummarymonthly middleware
  app.param('startdate', reportsummarymonthlies.reportStarDate);
  app.param('enddate', reportsummarymonthlies.reportEndDate);

  app.param('reportsummarymonthlyId', reportsummarymonthlies.reportsummarymonthlyByID);
};
