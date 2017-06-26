'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Reportdaily = mongoose.model('Reportdaily'),
    Checkin = mongoose.model('Checkin'),
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

    Reportdaily.findById(id).populate('user', 'displayName').exec(function(err, reportdaily) {
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

exports.reportdailyByDate = function(req, res, next, reportdate) {
    // body...
    var newDate = new Date(reportdate);
    var reportEndDate = null;
    var returnReportDaily = {};
    reportEndDate = new Date(reportdate + '11:13:00');
    console.log(newDate +'&&&&&&&&&&&'+ reportEndDate);
    // รายเดือน 
    // if (newDate.getMonth() > 10) {
    //     reportEndDate = new Date(newDate.getFullYear() + 1 + '-01');
    // } else {
    //     reportEndDate = new Date(newDate).setMonth(new Date(newDate).getMonth() + 1);
    // }
    // { created: { $gte: newDate, $lt: new Date(reportEndDate) } }
    Checkin.find({ created: { $gte: newDate, $lt: reportEndDate } }).populate({
        path: 'user',
        model: 'User',
        populate: {
            path: 'employeeprofile',
            model: 'Employeeprofile',
            populate: {
                path: 'company',
                model: 'Company'
            }
        }
    }).exec(function(err, reportdaily) {
        if (err) {
            return next(err);
        } else if (!reportdaily) {
            return res.status(404).send({
                message: 'No Reportdaily with that identifier has been found'
            });
        } else {
            var checkinByCompany = [];
            var reportDailyData = [];
            if (reportdaily.length > 0) {
                checkinByCompany = reportdaily.filter(function(obj) {
                    return obj.user.employeeprofile.company._id.toString() === req.user.company.toString();

                });
            }
            checkinByCompany.forEach(function(i, index) {
                reportDailyData.push({
                    employeeid: i.user.employeeprofile.employeeid,
                    firstname: i.user.employeeprofile.firstname,
                    lastname: i.user.employeeprofile.lastname,
                    timein: i.dateTimeIn,
                    timeout: i.dateTimeOut,
                    timelate: null,
                    locationIn: {
                        lat: i.locationIn.lat,
                        lng: i.locationIn.lng
                    },
                    locationOut: {
                        lat: i.locationOut.lat,
                        lng: i.locationOut.lng
                    },
                    device: i.user.deviceID,
                    distance: null,
                    workinghours: null,
                    overtime: null,
                    remark: {
                        timein: i.remark.in,
                        timeout: i.remark.out
                    },
                });
            });
            returnReportDaily.company = checkinByCompany[0] ? checkinByCompany[0].user.employeeprofile.company : null;
            returnReportDaily.data = reportDailyData;
            req._reportdaily = returnReportDaily;
            next();
        }
    });
};

exports.reportdaily = function(req, res, next) {
    // body...
    res.jsonp(req._reportdaily);
    // res.send('OK');
};