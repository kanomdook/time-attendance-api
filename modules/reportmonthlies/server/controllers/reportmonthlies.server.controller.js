'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reportmonthly = mongoose.model('Reportmonthly'),
  Checkin = mongoose.model('Checkin'),
  Company = mongoose.model('Company'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reportmonthly
 */
exports.create = function (req, res) {
  var reportmonthly = new Reportmonthly(req.body);
  reportmonthly.user = req.user;

  reportmonthly.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportmonthly);
    }
  });
};

/**
 * Show the current Reportmonthly
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var reportmonthly = req.reportmonthly ? req.reportmonthly.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  reportmonthly.isCurrentUserOwner = req.user && reportmonthly.user && reportmonthly.user._id.toString() === req.user._id.toString();

  res.jsonp(reportmonthly);
};

/**
 * Update a Reportmonthly
 */
exports.update = function (req, res) {
  var reportmonthly = req.reportmonthly;

  reportmonthly = _.extend(reportmonthly, req.body);

  reportmonthly.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportmonthly);
    }
  });
};

/**
 * Delete an Reportmonthly
 */
exports.delete = function (req, res) {
  var reportmonthly = req.reportmonthly;

  reportmonthly.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportmonthly);
    }
  });
};

/**
 * List of Reportmonthlies
 */
exports.list = function (req, res) {
  Reportmonthly.find().sort('-created').populate('user', 'displayName').exec(function (err, reportmonthlies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportmonthlies);
    }
  });
};

/**
 * Reportmonthly middleware
 */
exports.reportmonthlyByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reportmonthly is invalid'
    });
  }

  Reportmonthly.findById(id).populate('user', 'displayName').exec(function (err, reportmonthly) {
    if (err) {
      return next(err);
    } else if (!reportmonthly) {
      return res.status(404).send({
        message: 'No Reportmonthly with that identifier has been found'
      });
    }
    req.reportmonthly = reportmonthly;
    next();
  });
};

exports.reportmonthlyByDate = function (req, res, next, date) {
  var paramDate = new Date(date);
  var firstDay = new Date(paramDate.getFullYear(), paramDate.getMonth(), 1);
  var lastDay = new Date(new Date(paramDate.getFullYear(), paramDate.getMonth() + 1, 0).setHours(23, 59, 59, 999));
  Checkin.find({ created: { $gte: firstDay, $lte: lastDay } }).populate({
    path: 'user',
    model: 'User',
    populate: {
      path: 'employeeprofile',
      model: 'Employeeprofile'
    }
  }).exec(function (err, reportmonthly) {
    if (err) {
      return next(err);
    } else if (!reportmonthly) {
      return res.status(404).send({
        message: 'No Reportmonthly with that identifier has been found'
      });
    }
    req.firstDay = firstDay;
    req.lastDay = lastDay;
    req.reportbymonth = reportmonthly;
    next();
  });
};

exports.reportmonthlyByDateAndEmployeeId = function (req, res, next, employeeid) {
  var reportbymonth = req.reportbymonth;
  var reportbyemployee = [];
  if (reportbymonth.length > 0) {
    reportbyemployee = reportbymonth.filter(function (obj) {
      return obj.user.employeeprofile._id.toString() === employeeid.toString();
    });
  }
  req.reportbyemployee = reportbyemployee;
  next();
};

exports.reportmonthly = function (req, res, next) {
  var reportbyemployee = req.reportbyemployee;
  var returnReportMonthly = {};
  Company.findById(req.user.company).populate('user', 'displayName').exec(function (err, company) {
    if (err) {
      return next(err);
    } else if (!company) {
      return res.status(404).send({
        message: 'No Company with that identifier has been found'
      });
    } else {
      returnReportMonthly.company = company;
      returnReportMonthly.employeeprofile = reportbyemployee[0].user.employeeprofile;
      returnReportMonthly.firstDay = req.firstDay;
      returnReportMonthly.lastDay = req.lastDay;
      returnReportMonthly.reportbyemployee = reportbyemployee;
      res.jsonp(returnReportMonthly);
    }
  });
};