'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Reportmonthly = mongoose.model('Reportmonthly'),
  Checkin = mongoose.model('Checkin'),
  Company = mongoose.model('Company'),
  Employeeprofile = mongoose.model('Employeeprofile'),
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
  req.employeeid = employeeid;
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

      Employeeprofile.findById(req.employeeid).populate('user', 'displayName').exec(function (err, employeeprofile) {
        if (err) {
          return next(err);
        } else if (!employeeprofile) {
          return res.status(404).send({
            message: 'No Employeeprofile with that identifier has been found'
          });
        }
        var reportMonthlyData = [];
        reportbyemployee.forEach(function (i, index) {
          var distance = getDistanceFromLatLonInKm(i.locationIn.lat, i.locationIn.lng, company.address.location.latitude, company.address.location.longitude);
          var workhours = null;
          var timelate = null;
          if (i.dateTimeIn && i.dateTimeOut) {
            workhours = workingHoursBetweenDates(i.dateTimeIn, i.dateTimeOut);
          } else if (i.dateTimeIn) {
            timelate = workingHoursBetweenDates(employeeprofile.shiftin, i.dateTimeIn);
            console.log(timelate + ":" + employeeprofile.shiftin + " " +i.dateTimeIn);
          }
          reportMonthlyData.push({
            date: i.created,
            day: new Date(i.created).getDay(),
            timein: i.dateTimeIn,
            timeout: i.dateTimeOut,
            timelate: timelate,
            workinghours: workhours,
            locationIn: {
              lat: i.locationIn.lat,
              lng: i.locationIn.lng
            },
            locationOut: {
              lat: i.locationOut.lat,
              lng: i.locationOut.lng
            },
            type: i.type,
            device: i.user.deviceID,
            distance: distance.toFixed(2),
            remark: {
              timein: i.remark.in,
              timeout: i.remark.out
            }
          });
        });
        returnReportMonthly.company = company;
        returnReportMonthly.employeeprofile = employeeprofile;
        returnReportMonthly.firstDay = req.firstDay;
        returnReportMonthly.lastDay = req.lastDay;
        returnReportMonthly.data = reportMonthlyData;
        res.jsonp(returnReportMonthly);
      });
    }
  });
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
// get hours
function workingHoursBetweenDates(startDateTime, endDateTime) {
  var start = new Date(startDateTime).getHours() + ":" + new Date(startDateTime).getMinutes();
  var end = new Date(endDateTime).getHours() + ":" + new Date(endDateTime).getMinutes();
  start = start.split(":");
  end = end.split(":");
  var startDate = new Date(0, 0, 0, start[0], start[1], 0);
  var endDate = new Date(0, 0, 0, end[0], end[1], 0);
  var diff = endDate.getTime() - startDate.getTime();
  var hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  var minutes = Math.floor(diff / 1000 / 60);

  // If using time pickers with 24 hours format, add the below line get exact hours
  if (hours < 0)
    hours = hours + 24;

  return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
}