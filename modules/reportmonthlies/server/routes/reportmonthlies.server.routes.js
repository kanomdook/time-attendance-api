'use strict';

/**
 * Module dependencies
 */
var reportmonthliesPolicy = require('../policies/reportmonthlies.server.policy'),
  reportmonthlies = require('../controllers/reportmonthlies.server.controller');

module.exports = function (app) {
  // Reportmonthlies Routes
  app.route('/api/reportmonthlies').all(reportmonthliesPolicy.isAllowed)
    .get(reportmonthlies.list)
    .post(reportmonthlies.create);

  app.route('/api/reportmonthlies/:reportmonthlyId').all(reportmonthliesPolicy.isAllowed)
    .get(reportmonthlies.read)
    .put(reportmonthlies.update)
    .delete(reportmonthlies.delete);

  // Reportdailies Routes
  app.route('/api/reportmonthly/:date/:employeeid').all(reportmonthliesPolicy.isAllowed)
    .get(reportmonthlies.reportmonthly);

  // Finish by binding the Reportmonthly middleware
  app.param('date', reportmonthlies.reportmonthlyByDate);
  app.param('employeeid', reportmonthlies.reportmonthlyByDateAndEmployeeId);
  app.param('reportmonthlyId', reportmonthlies.reportmonthlyByID);
};
