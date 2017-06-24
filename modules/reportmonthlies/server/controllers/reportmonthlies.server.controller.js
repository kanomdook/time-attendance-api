'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reportmonthly = mongoose.model('Reportmonthly'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reportmonthly
 */
exports.create = function(req, res) {
  var reportmonthly = new Reportmonthly(req.body);
  reportmonthly.user = req.user;

  reportmonthly.save(function(err) {
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
exports.read = function(req, res) {
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
exports.update = function(req, res) {
  var reportmonthly = req.reportmonthly;

  reportmonthly = _.extend(reportmonthly, req.body);

  reportmonthly.save(function(err) {
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
exports.delete = function(req, res) {
  var reportmonthly = req.reportmonthly;

  reportmonthly.remove(function(err) {
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
exports.list = function(req, res) {
  Reportmonthly.find().sort('-created').populate('user', 'displayName').exec(function(err, reportmonthlies) {
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
exports.reportmonthlyByID = function(req, res, next, id) {

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
