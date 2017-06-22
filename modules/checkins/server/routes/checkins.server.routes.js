'use strict';

/**
 * Module dependencies
 */
var checkinsPolicy = require('../policies/checkins.server.policy'),
  checkins = require('../controllers/checkins.server.controller');

module.exports = function (app) {
  // Checkins Routes
  app.route('/api/checkins').all(checkinsPolicy.isAllowed)
    .get(checkins.list)
    .post(checkins.create);

  app.route('/api/checkins/userid/:userid')
    .get(checkins.userids);

  app.route('/api/checkins/yearmonth&userid/:yearMonth/:id')
    .get(checkins.getById);

  app.route('/api/checkins/:checkinId').all(checkinsPolicy.isAllowed)
    .get(checkins.read)
    .put(checkins.update)
    .delete(checkins.delete);

  // Checkins Routes By Company
  app.route('/api/checkin/company').all(checkinsPolicy.isAllowed)
    .get(checkins.listByCompany)
    .post(checkins.create);

  app.route('/api/checkin/company/:checkinId').all(checkinsPolicy.isAllowed)
    .get(checkins.read)
    .put(checkins.update)
    .delete(checkins.delete);

  // Finish by binding the Checkin middleware
  app.param('checkinId', checkins.checkinByID);
  app.param('userid', checkins.userById);

  app.param('id', checkins.getByUserID);
  app.param('yearMonth', function (req, res, next, yearMonth) {
    req.yearMonth = yearMonth;
    next();
  });
};
