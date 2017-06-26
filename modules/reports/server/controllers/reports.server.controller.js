'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Report = mongoose.model('Report'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash'),
    excel = require('node-excel-export');

/**
 * Create a Report
 */
exports.create = function(req, res) {
    var report = new Report(req.body);
    report.user = req.user;

    report.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(report);
        }
    });
};

/**
 * Show the current Report
 */
exports.read = function(req, res) {
    // convert mongoose document to JSON
    var report = req.report ? req.report.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    report.isCurrentUserOwner = req.user && report.user && report.user._id.toString() === req.user._id.toString();

    res.jsonp(report);
};

/**
 * Update a Report
 */
exports.update = function(req, res) {
    var report = req.report;

    report = _.extend(report, req.body);

    report.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(report);
        }
    });
};

/**
 * Delete an Report
 */
exports.delete = function(req, res) {
    var report = req.report;

    report.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(report);
        }
    });
};

/**
 * List of Reports
 */
exports.list = function(req, res) {
    Report.find().sort('-created').populate('user', 'displayName').exec(function(err, reports) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(reports);
        }
    });
};

/**
 * Report middleware
 */
exports.reportByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Report is invalid'
        });
    }

    Report.findById(id).populate('user', 'displayName').exec(function(err, report) {
        if (err) {
            return next(err);
        } else if (!report) {
            return res.status(404).send({
                message: 'No Report with that identifier has been found'
            });
        }
        req.report = report;
        next();
    });
};



exports.excel = function(req, res) {
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
    res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers) 
    return res.send(report);
};
