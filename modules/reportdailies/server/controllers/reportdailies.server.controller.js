'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reportdaily = mongoose.model('Reportdaily'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reportdaily
 */
exports.create = function(req, res) {
  var reportdaily = new Reportdaily(req.body);
  reportdaily.user = req.user;

  reportdaily.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportdaily);
    }
  });
};

/**
 * Show the current Reportdaily
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var reportdaily = req.reportdaily ? req.reportdaily.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  reportdaily.isCurrentUserOwner = req.user && reportdaily.user && reportdaily.user._id.toString() === req.user._id.toString();

  res.jsonp(reportdaily);
};

/**
 * Update a Reportdaily
 */
exports.update = function(req, res) {
  var reportdaily = req.reportdaily;

  reportdaily = _.extend(reportdaily, req.body);

  reportdaily.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportdaily);
    }
  });
};

/**
 * Delete an Reportdaily
 */
exports.delete = function(req, res) {
  var reportdaily = req.reportdaily;

  reportdaily.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportdaily);
    }
  });
};

/**
 * List of Reportdailies
 */
exports.list = function(req, res) {
  Reportdaily.find().sort('-created').populate('user', 'displayName').exec(function(err, reportdailies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportdailies);
    }
  });
};

/**
 * Reportdaily middleware
 */
exports.reportdailyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reportdaily is invalid'
    });
  }

  Reportdaily.findById(id).populate('user', 'displayName').exec(function (err, reportdaily) {
    if (err) {
      return next(err);
    } else if (!reportdaily) {
      return res.status(404).send({
        message: 'No Reportdaily with that identifier has been found'
      });
    }
    req.reportdaily = reportdaily;
    next();
  });
};
