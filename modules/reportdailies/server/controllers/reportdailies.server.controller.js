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
exports.create = function (req, res) {
    var reportdaily = new Reportdaily(req.body);
    reportdaily.user = req.user;

    reportdaily.save(function (err) {
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
exports.read = function (req, res) {
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
exports.update = function (req, res) {
    var reportdaily = req.reportdaily;

    reportdaily = _.extend(reportdaily, req.body);

    reportdaily.save(function (err) {
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
exports.delete = function (req, res) {
    var reportdaily = req.reportdaily;

    reportdaily.remove(function (err) {
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
exports.list = function (req, res) {
    Reportdaily.find().sort('-created').populate('user', 'displayName').exec(function (err, reportdailies) {
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
exports.reportdailyByID = function (req, res, next, id) {

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

exports.reportdailyByDate = function (req, res, next, reportdate) {
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
    Company.findById(req.user.company).populate('user', 'displayName').exec(function (err, company) {
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
            }).exec(function (err, reportdaily) {
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
                        checkinByCompany = reportdaily.filter(function (obj) {
                            return obj.user.employeeprofile.company._id.toString() === req.user.company.toString();

                        });
                    }
                    checkinByCompany.forEach(function (i, index) {
                        var distance = getDistanceFromLatLonInKm(i.locationIn.lat, i.locationIn.lng, company.address.location.latitude, company.address.location.longitude);
                        var workhours = null;
                        // if (i.dateTimeIn && i.dateTimeOut) {
                        //     workhours = workingHoursBetweenDates(i.dateTimeIn, i.dateTimeOut);
                        // }
                        reportDailyData.push({
                            employeeid: i.user.employeeprofile.employeeid,
                            firstname: i.user.employeeprofile.firstname,
                            lastname: i.user.employeeprofile.lastname,
                            datetimein: i.dateTimeIn,
                            datetimeout: i.dateTimeOut,
                            timelate: null,
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
                            workinghours: workhours,
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

exports.reportdaily = function (req, res, next) {
    res.jsonp(req._reportdaily);
};

exports.exportByDate = function (req, res, next) {
    console.dir(req._reportdaily);
    req._reportdaily.date = req._reportdaily.date.split(':')[1];
    var date = req._reportdaily.date.split('-')[2] + '/' + req._reportdaily.date.split('-')[1] + '/' + req._reportdaily.date.split('-')[0];
    var styles = {
        headerDark: {
            fill: {
                fgColor: {
                    rgb: 'FFFFFFFF'
                }
            },
            font: {
                color: {
                    rgb: 'FF000000'
                },
                sz: 12,
                bold: false,
                underline: false
            }
        },
        default: {
            fill: {
                fgColor: {
                    rgb: 'FFC0C0C0'
                }
            },
            font: {
                color: {
                    rgb: 'FF000000'
                },
                sz: 12,
                bold: false,
                underline: false
            }
        }
    };

    var heading = [
        [{ value: 'รายงานการมาทำงานของพนักงาน (รายวัน)', style: styles.headerDark }], // <-- It can be only values 
        ['วันที่', date]
    ];

    var specification = {
        number: { // <- the key should match the actual data key 
            displayName: 'ลำดับ', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 40 // <- width in pixels 
        },
        employeeid: { // <- the key should match the actual data key 
            displayName: 'รหัสพนักงาน', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        firstname: { // <- the key should match the actual data key 
            displayName: 'ชื่อ', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 120 // <- width in pixels 
        },
        lastname: { // <- the key should match the actual data key 
            displayName: 'นามสกุล', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 120 // <- width in pixels 
        },
        startdate: { // <- the key should match the actual data key 
            displayName: 'เวลาเข้า', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        enddate: { // <- the key should match the actual data key 
            displayName: 'เวลาออก', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        latitudein: { // <- the key should match the actual data key 
            displayName: 'ละติจูดเข้า', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        longitudein: { // <- the key should match the actual data key 
            displayName: 'ลองติจูดเข้า', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        latitudeout: { // <- the key should match the actual data key 
            displayName: 'ละติจูดออก', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        longitudeout: { // <- the key should match the actual data key 
            displayName: 'ลองติจูดออก', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 80 // <- width in pixels 
        },
        type: { // <- the key should match the actual data key 
            displayName: 'ประเภท', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 100 // <- width in pixels 
        },
        device: { // <- the key should match the actual data key 
            displayName: 'เครื่อง', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 100 // <- width in pixels 
        },
        distance: { // <- the key should match the actual data key 
            displayName: 'ระยะห่างจากสนง. (กม.)', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 100 // <- width in pixels 
        },
        timelate: { // <- the key should match the actual data key 
            displayName: 'สาย(ชม.นาที)', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 100 // <- width in pixels 
        },
        workinghours: { // <- the key should match the actual data key 
            displayName: 'ชั่วโมงทำงาน', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 100 // <- width in pixels 
        },
        remarkin: { // <- the key should match the actual data key 
            displayName: 'หมายเหตุ(เข้างาน)', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 120 // <- width in pixels 
        },
        remarkout: { // <- the key should match the actual data key 
            displayName: 'หมายเหตุ(ออกงาน)', // <- Here you specify the column header 
            headerStyle: styles.default, // <- Header style 
            width: 120 // <- width in pixels 
        },
    };

    var dataset = [];

    req._reportdaily.data.forEach(function (i, index) {
        var startdate = new Date(i.datetimein);
        var enddate = new Date(i.datetimeout);
        var startdateText = (startdate.getUTCHours() + 7) + ':' + startdate.getUTCMinutes() + ':' + startdate.getUTCSeconds();
        var enddateText = (enddate.getUTCHours() + 7) + ':' + enddate.getUTCMinutes() + ':' + enddate.getUTCSeconds();
        dataset.push({
            number: (index + 1),
            employeeid: i.employeeid,
            firstname: i.firstname,
            lastname: i.lastname,
            startdate: startdateText,
            enddate: enddateText,
            latitudein: i.locationIn.lat,
            longitudein: i.locationIn.lng,
            latitudeout: i.locationOut.lat,
            longitudeout: i.locationOut.lng,
            type: i.type,
            device: i.device,
            distance: i.distance,
            timelate: i.timelate,
            workinghours: i.workinghours,
            remarkin: i.remark.timein,
            remarkout: i.remark.timeout
        });
    });

    var merges = [
        { start: { row: 1, column: 1 }, end: { row: 1, column: 17 } }
    ];

    var report = excel.buildExport(
        [
            {
                name: 'Report', // <- Specify sheet name (optional) 
                heading: heading, // <- Raw heading array (optional) 
                merges: merges, // <- Merge cell ranges 
                specification: specification, // <- Report specification 
                data: dataset // <-- Report data 
            }
        ]
    );

    req.export = report;
    next();
};

exports.exportExcel = function (req, res, next) {
    res.attachment('reportdaily' + req._reportdaily.date + '.xlsx'); // This is sails.js specific (in general you need to set headers) 
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

function workingHoursBetweenDates(startDate, endDate) {
    // Store minutes worked
    var minutesWorked = 0;

    // Validate input
    if (endDate < startDate) { return 0; }

    // Loop from your Start to End dates (by hour)
    var current = startDate;

    // Define work range
    var workHoursStart = 9;
    var workHoursEnd = 18;
    var includeWeekends = false;

    // Loop while currentDate is less than end Date (by minutes)
    while (current <= endDate) {
        // Is the current time within a work day (and if it occurs on a weekend or not)
        if (current.getHours() >= workHoursStart && current.getHours() <= workHoursEnd && (includeWeekends ? current.getDay() !== 0 && current.getDay() !== 6 : true)) {
            minutesWorked++;
        }

        // Increment current time
        current.setTime(current.getTime() + 1000 * 60);
    }
    // console.log(minutesWorked / 60);
    // Return the number of hours
    return minutesWorked / 60;
}