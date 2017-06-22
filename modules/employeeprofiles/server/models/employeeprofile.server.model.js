'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Employeeprofile Schema
 */
var EmployeeprofileSchema = new Schema({
    email: {
        type: String,
        required: 'Please fill email',
        unique: 'Email already exists'
    },
    company: {
        type: Schema.ObjectId,
        ref: 'Company'
    },
    address: {
        address: {
            type: String,
        },
        district: {
            type: String,
        },
        subdistrict: {
            type: String,
        },
        postcode: {
            type: String,
        },
        province: {
            type: String,
        },
        country: {
            cca2: {
                type: String
            },
            cca3: {
                type: String
            },
            en: {
                common: {
                    type: String
                },
                official: {
                    type: String
                }
            },
            th: {
                type: String
            },
            currency: {
                type: String
            }
        },
        location: {
            latitude: {
                type: String
            },
            longitude: {
                type: String
            }
        }
    },
    shiftin: {
        type: Date
    },
    shiftout: {
        type: Date
    },
    leader: {
        type: Schema.ObjectId,
        ref: 'Employeeprofile'
    },
    jobTitle: {
        type: String,
    },
    Line: {
        type: String,
    },
    image: {
        type: String,
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    Tel: {
        type: String,
    },
    Facebook: {
        type: String,
    },
    deviceId: {
        type: String,
    },
    platform: {
        type: String,
    },
    mobile: {
        type: String,
    },
    departmentCode: {
        type: String,
    },
    locationCode: {
        type: String,
    },
    positionByJob: {
        type: String,
    },
    fingerscannerid: {
        type: String,
    },
    fingerid: {
        type: String,
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Employeeprofile', EmployeeprofileSchema);
