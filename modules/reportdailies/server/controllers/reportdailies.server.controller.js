'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Reportdaily = mongoose.model('Reportdaily'),
    Checkin = mongoose.model('Checkin'),
    Company = mongoose.model('Company'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash'),
    excel = require('node-excel-export');

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
    var newDate = new Date(reportdate);
    var reportEndDate = null;
    var returnReportDaily = {};
    reportEndDate = new Date(reportdate + ' 23:59:59');
    console.log(newDate + "-" + reportEndDate);
    // รายเดือน 
    // if (newDate.getMonth() > 10) {
    //     reportEndDate = new Date(newDate.getFullYear() + 1 + '-01');
    // } else {
    //     reportEndDate = new Date(newDate).setMonth(new Date(newDate).getMonth() + 1);
    // }
    // { created: { $gte: newDate, $lt: new Date(reportEndDate) } }
    Company.findById(req.user.company).populate('user', 'displayName').exec(function(err, company) {
        if (err) {
            return next(err);
        } else if (!company) {
            return res.status(404).send({
                message: 'No Company with that identifier has been found'
            });
        } else {
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
                        var distance = getDistanceFromLatLonInKm(i.locationIn.lat, i.locationIn.lng, company.address.location.latitude, company.address.location.longitude);
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
                            distance: distance.toFixed(2),
                            workinghours: null,
                            overtime: null,
                            remark: {
                                timein: i.remark.in,
                                timeout: i.remark.out
                            },
                        });
                    });
                    returnReportDaily.date = reportdate;
                    returnReportDaily.company = company;
                    returnReportDaily.data = reportDailyData;
                    req._reportdaily = returnReportDaily;
                    next();
                }
            });
        }
    });
};

exports.reportdaily = function(req, res, next) {
    res.jsonp(req._reportdaily);
};

exports.exportByDate = function(req, res, next, date) {
    console.log(date);
    var styles = {
        headerDark: {
            fill: {
                fgColor: {
                    rgb: 'FF000000'
                }
            },
            font: {
                color: {
                    rgb: 'FFFFFFFF'
                },
                sz: 14,
                bold: true,
                underline: true
            }
        },
        cellPink: {
            fill: {
                fgColor: {
                    rgb: 'FFFFCCFF'
                }
            }
        },
        cellGreen: {
            fill: {
                fgColor: {
                    rgb: 'FF00FF00'
                }
            }
        }
    };

    //Array of objects representing heading rows (very top) 
    var heading = [
        [{ value: 'ทดสอบ สวัสดีครับ', style: styles.headerDark }, { value: 'b1', style: styles.headerDark }, { value: 'c1', style: styles.headerDark }],
        ['a2', 'b2', 'c2'] // <-- It can be only values 
    ];

    //Here you specify the export structure 
    var specification = {
        customer_name: { // <- the key should match the actual data key 
            displayName: 'Customer', // <- Here you specify the column header 
            headerStyle: styles.headerDark, // <- Header style 
            cellStyle: function(value, row) { // <- style renderer function 
                // if the status is 1 then color in green else color in red 
                // Notice how we use another cell value to style the current one 
                return (row.status_id === 1) ? styles.cellGreen : { fill: { fgColor: { rgb: 'FFFF0000' } } }; // <- Inline cell style is possible  
            },
            width: 120 // <- width in pixels 
        },
        status_id: {
            displayName: 'Status',
            headerStyle: styles.headerDark,
            cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property 
                return (value === 1) ? 'Active' : 'Inactive';
            },
            width: '10' // <- width in chars (when the number is passed as string) 
        },
        note: {
            displayName: 'Description',
            headerStyle: styles.headerDark,
            cellStyle: styles.cellPink, // <- Cell style 
            width: 220 // <- width in pixels 
        }
    };

    // The data set should have the following shape (Array of Objects) 
    // The order of the keys is irrelevant, it is also irrelevant if the 
    // dataset contains more fields as the report is build based on the 
    // specification provided above. But you should have all the fields 
    // that are listed in the report specification 
    var dataset = [
        { customer_name: 'สวัสดีครับ', status_id: 1, note: 'some สวัสดีครับ', misc: 'not shown' },
        { customer_name: 'สวัสดีครับ', status_id: 0, note: 'some note' },
        { customer_name: 'สวัสดีครับ', status_id: 0, note: 'some note', misc: 'not shown' }
    ];

    // Define an array of merges. 1-1 = A:1 
    // The merges are independent of the data. 
    // A merge will overwrite all data _not_ in the top-left cell. 
    var merges = [
        { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
        { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
        { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
    ];

    // Create the excel report. 
    // This function will return Buffer 
    var report = excel.buildExport(
        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report 
            {
                name: 'Report', // <- Specify sheet name (optional) 
                heading: heading, // <- Raw heading array (optional) 
                merges: merges, // <- Merge cell ranges 
                specification: specification, // <- Report specification 
                data: dataset // <-- Report data 
            }
        ]
    );

    // You can then return this straight 
    // res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
    // return res.send(report);
    req.export = report;
    next();
};

exports.exportExcel = function(req, res, next) {
    res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
    return res.send(req.export);
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
