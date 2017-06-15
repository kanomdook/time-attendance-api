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
  },
  company: {
    type: Schema.ObjectId,
    ref: 'Company'
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
