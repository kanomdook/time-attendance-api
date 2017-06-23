'use strict';

/**
 * Module dependencies
 */
var employeeprofilesPolicy = require('../policies/employeeprofiles.server.policy'),
<<<<<<< HEAD
  employeeprofiles = require('../controllers/employeeprofiles.server.controller');

module.exports = function (app) {
  // Employeeprofiles Routes
  app.route('/api/employeeprofiles')
  .all(employeeprofilesPolicy.isAllowed)
    .get(employeeprofiles.list)
    .post(employeeprofiles.create);

  app.route('/api/employeeprofiles/:employeeprofileId').all(employeeprofilesPolicy.isAllowed)
    .get(employeeprofiles.read)
    .put(employeeprofiles.update)
    .delete(employeeprofiles.delete);

  // Employeeprofiles Routes By Company
  app.route('/api/employee/company').all(employeeprofilesPolicy.isAllowed)
    .get(employeeprofiles.listByCompany)
    .post(employeeprofiles.create);

  app.route('/api/employee/company/:employeeprofileId').all(employeeprofilesPolicy.isAllowed)
    .get(employeeprofiles.read)
    .put(employeeprofiles.update)
    .delete(employeeprofiles.delete);

  app.route('/api/Employeeprofile/email/:email')
    .get(employeeprofiles.checkemail);
  // Finish by binding the Employeeprofile middleware
  app.param('employeeprofileId', employeeprofiles.employeeprofileByID);
  app.param('email', employeeprofiles.email);
=======
    employeeprofiles = require('../controllers/employeeprofiles.server.controller');

module.exports = function(app) {
    // Employeeprofiles Routes
    app.route('/api/employeeprofiles').all(employeeprofilesPolicy.isAllowed)
        .get(employeeprofiles.list)
        .post(employeeprofiles.create);

    app.route('/api/employeeprofiles/:employeeprofileId').all(employeeprofilesPolicy.isAllowed)
        .get(employeeprofiles.read)
        .put(employeeprofiles.update)
        .delete(employeeprofiles.delete);

    // Employeeprofiles Routes By Company
    app.route('/api/employee/company').all(employeeprofilesPolicy.isAllowed)
        .get(employeeprofiles.listByCompany)
        .post(employeeprofiles.create);

    app.route('/api/employee/company/:employeeprofileId').all(employeeprofilesPolicy.isAllowed)
        .get(employeeprofiles.read)
        .put(employeeprofiles.update)
        .delete(employeeprofiles.delete);

    app.route('/api/Employeeprofile/email/:email')
        .get(employeeprofiles.checkemail);

    // Finish by binding the Employeeprofile middleware
    app.param('employeeprofileId', employeeprofiles.employeeprofileByID);
    app.param('email', employeeprofiles.email);
>>>>>>> 0dc0e34f0b913c9e90c82ca13c4186ed565e5130

};
