'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Company Schema
 */
var CompanySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Company name',
    trim: true
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
      type: String,
    }
  },
  tel: {
    type: String,
  },
  fax: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  note: {
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

mongoose.model('Company', CompanySchema);
