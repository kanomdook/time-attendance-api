'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reportsummarymonthly = mongoose.model('Reportsummarymonthly'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Reportsummarymonthly
 */
exports.create = function(req, res) {
  var reportsummarymonthly = new Reportsummarymonthly(req.body);
  reportsummarymonthly.user = req.user;

  reportsummarymonthly.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportsummarymonthly);
    }
  });
};

/**
 * Show the current Reportsummarymonthly
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var reportsummarymonthly = req.reportsummarymonthly ? req.reportsummarymonthly.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  reportsummarymonthly.isCurrentUserOwner = req.user && reportsummarymonthly.user && reportsummarymonthly.user._id.toString() === req.user._id.toString();

  res.jsonp(reportsummarymonthly);
};

/**
 * Update a Reportsummarymonthly
 */
exports.update = function(req, res) {
  var reportsummarymonthly = req.reportsummarymonthly;

  reportsummarymonthly = _.extend(reportsummarymonthly, req.body);

  reportsummarymonthly.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportsummarymonthly);
    }
  });
};

/**
 * Delete an Reportsummarymonthly
 */
exports.delete = function(req, res) {
  var reportsummarymonthly = req.reportsummarymonthly;

  reportsummarymonthly.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportsummarymonthly);
    }
  });
};

/**
 * List of Reportsummarymonthlies
 */
exports.list = function(req, res) {
  Reportsummarymonthly.find().sort('-created').populate('user', 'displayName').exec(function(err, reportsummarymonthlies) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(reportsummarymonthlies);
    }
  });
};

/**
 * Reportsummarymonthly middleware
 */
exports.reportsummarymonthlyByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Reportsummarymonthly is invalid'
    });
  }

  Reportsummarymonthly.findById(id).populate('user', 'displayName').exec(function (err, reportsummarymonthly) {
    if (err) {
      return next(err);
    } else if (!reportsummarymonthly) {
      return res.status(404).send({
        message: 'No Reportsummarymonthly with that identifier has been found'
      });
    }
    req.reportsummarymonthly = reportsummarymonthly;
    next();
  });
};
