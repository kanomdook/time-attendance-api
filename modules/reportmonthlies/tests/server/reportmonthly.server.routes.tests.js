'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reportmonthly = mongoose.model('Reportmonthly'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  reportmonthly;

/**
 * Reportmonthly routes tests
 */
describe('Reportmonthly CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Reportmonthly
    user.save(function () {
      reportmonthly = {
        name: 'Reportmonthly name'
      };

      done();
    });
  });

  it('should be able to save a Reportmonthly if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reportmonthly
        agent.post('/api/reportmonthlies')
          .send(reportmonthly)
          .expect(200)
          .end(function (reportmonthlySaveErr, reportmonthlySaveRes) {
            // Handle Reportmonthly save error
            if (reportmonthlySaveErr) {
              return done(reportmonthlySaveErr);
            }

            // Get a list of Reportmonthlies
            agent.get('/api/reportmonthlies')
              .end(function (reportmonthliesGetErr, reportmonthliesGetRes) {
                // Handle Reportmonthlies save error
                if (reportmonthliesGetErr) {
                  return done(reportmonthliesGetErr);
                }

                // Get Reportmonthlies list
                var reportmonthlies = reportmonthliesGetRes.body;

                // Set assertions
                (reportmonthlies[0].user._id).should.equal(userId);
                (reportmonthlies[0].name).should.match('Reportmonthly name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Reportmonthly if not logged in', function (done) {
    agent.post('/api/reportmonthlies')
      .send(reportmonthly)
      .expect(403)
      .end(function (reportmonthlySaveErr, reportmonthlySaveRes) {
        // Call the assertion callback
        done(reportmonthlySaveErr);
      });
  });

  it('should not be able to save an Reportmonthly if no name is provided', function (done) {
    // Invalidate name field
    reportmonthly.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reportmonthly
        agent.post('/api/reportmonthlies')
          .send(reportmonthly)
          .expect(400)
          .end(function (reportmonthlySaveErr, reportmonthlySaveRes) {
            // Set message assertion
            (reportmonthlySaveRes.body.message).should.match('Please fill Reportmonthly name');

            // Handle Reportmonthly save error
            done(reportmonthlySaveErr);
          });
      });
  });

  it('should be able to update an Reportmonthly if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reportmonthly
        agent.post('/api/reportmonthlies')
          .send(reportmonthly)
          .expect(200)
          .end(function (reportmonthlySaveErr, reportmonthlySaveRes) {
            // Handle Reportmonthly save error
            if (reportmonthlySaveErr) {
              return done(reportmonthlySaveErr);
            }

            // Update Reportmonthly name
            reportmonthly.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Reportmonthly
            agent.put('/api/reportmonthlies/' + reportmonthlySaveRes.body._id)
              .send(reportmonthly)
              .expect(200)
              .end(function (reportmonthlyUpdateErr, reportmonthlyUpdateRes) {
                // Handle Reportmonthly update error
                if (reportmonthlyUpdateErr) {
                  return done(reportmonthlyUpdateErr);
                }

                // Set assertions
                (reportmonthlyUpdateRes.body._id).should.equal(reportmonthlySaveRes.body._id);
                (reportmonthlyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Reportmonthlies if not signed in', function (done) {
    // Create new Reportmonthly model instance
    var reportmonthlyObj = new Reportmonthly(reportmonthly);

    // Save the reportmonthly
    reportmonthlyObj.save(function () {
      // Request Reportmonthlies
      request(app).get('/api/reportmonthlies')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Reportmonthly if not signed in', function (done) {
    // Create new Reportmonthly model instance
    var reportmonthlyObj = new Reportmonthly(reportmonthly);

    // Save the Reportmonthly
    reportmonthlyObj.save(function () {
      request(app).get('/api/reportmonthlies/' + reportmonthlyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', reportmonthly.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Reportmonthly with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/reportmonthlies/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reportmonthly is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Reportmonthly which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Reportmonthly
    request(app).get('/api/reportmonthlies/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Reportmonthly with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Reportmonthly if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Reportmonthly
        agent.post('/api/reportmonthlies')
          .send(reportmonthly)
          .expect(200)
          .end(function (reportmonthlySaveErr, reportmonthlySaveRes) {
            // Handle Reportmonthly save error
            if (reportmonthlySaveErr) {
              return done(reportmonthlySaveErr);
            }

            // Delete an existing Reportmonthly
            agent.delete('/api/reportmonthlies/' + reportmonthlySaveRes.body._id)
              .send(reportmonthly)
              .expect(200)
              .end(function (reportmonthlyDeleteErr, reportmonthlyDeleteRes) {
                // Handle reportmonthly error error
                if (reportmonthlyDeleteErr) {
                  return done(reportmonthlyDeleteErr);
                }

                // Set assertions
                (reportmonthlyDeleteRes.body._id).should.equal(reportmonthlySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Reportmonthly if not signed in', function (done) {
    // Set Reportmonthly user
    reportmonthly.user = user;

    // Create new Reportmonthly model instance
    var reportmonthlyObj = new Reportmonthly(reportmonthly);

    // Save the Reportmonthly
    reportmonthlyObj.save(function () {
      // Try deleting Reportmonthly
      request(app).delete('/api/reportmonthlies/' + reportmonthlyObj._id)
        .expect(403)
        .end(function (reportmonthlyDeleteErr, reportmonthlyDeleteRes) {
          // Set message assertion
          (reportmonthlyDeleteRes.body.message).should.match('User is not authorized');

          // Handle Reportmonthly error error
          done(reportmonthlyDeleteErr);
        });

    });
  });

  it('should be able to get a single Reportmonthly that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Reportmonthly
          agent.post('/api/reportmonthlies')
            .send(reportmonthly)
            .expect(200)
            .end(function (reportmonthlySaveErr, reportmonthlySaveRes) {
              // Handle Reportmonthly save error
              if (reportmonthlySaveErr) {
                return done(reportmonthlySaveErr);
              }

              // Set assertions on new Reportmonthly
              (reportmonthlySaveRes.body.name).should.equal(reportmonthly.name);
              should.exist(reportmonthlySaveRes.body.user);
              should.equal(reportmonthlySaveRes.body.user._id, orphanId);

              // force the Reportmonthly to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Reportmonthly
                    agent.get('/api/reportmonthlies/' + reportmonthlySaveRes.body._id)
                      .expect(200)
                      .end(function (reportmonthlyInfoErr, reportmonthlyInfoRes) {
                        // Handle Reportmonthly error
                        if (reportmonthlyInfoErr) {
                          return done(reportmonthlyInfoErr);
                        }

                        // Set assertions
                        (reportmonthlyInfoRes.body._id).should.equal(reportmonthlySaveRes.body._id);
                        (reportmonthlyInfoRes.body.name).should.equal(reportmonthly.name);
                        should.equal(reportmonthlyInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Reportmonthly.remove().exec(done);
    });
  });
});
