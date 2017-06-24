'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Reportdaily = mongoose.model('Reportdaily'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  reportdaily;

/**
 * Reportdaily routes tests
 */
describe('Reportdaily CRUD tests', function () {

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

    // Save a user to the test db and create new Reportdaily
    user.save(function () {
      reportdaily = {
        name: 'Reportdaily name'
      };

      done();
    });
  });

  it('should be able to save a Reportdaily if logged in', function (done) {
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

        // Save a new Reportdaily
        agent.post('/api/reportdailies')
          .send(reportdaily)
          .expect(200)
          .end(function (reportdailySaveErr, reportdailySaveRes) {
            // Handle Reportdaily save error
            if (reportdailySaveErr) {
              return done(reportdailySaveErr);
            }

            // Get a list of Reportdailies
            agent.get('/api/reportdailies')
              .end(function (reportdailiesGetErr, reportdailiesGetRes) {
                // Handle Reportdailies save error
                if (reportdailiesGetErr) {
                  return done(reportdailiesGetErr);
                }

                // Get Reportdailies list
                var reportdailies = reportdailiesGetRes.body;

                // Set assertions
                (reportdailies[0].user._id).should.equal(userId);
                (reportdailies[0].name).should.match('Reportdaily name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Reportdaily if not logged in', function (done) {
    agent.post('/api/reportdailies')
      .send(reportdaily)
      .expect(403)
      .end(function (reportdailySaveErr, reportdailySaveRes) {
        // Call the assertion callback
        done(reportdailySaveErr);
      });
  });

  it('should not be able to save an Reportdaily if no name is provided', function (done) {
    // Invalidate name field
    reportdaily.name = '';

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

        // Save a new Reportdaily
        agent.post('/api/reportdailies')
          .send(reportdaily)
          .expect(400)
          .end(function (reportdailySaveErr, reportdailySaveRes) {
            // Set message assertion
            (reportdailySaveRes.body.message).should.match('Please fill Reportdaily name');

            // Handle Reportdaily save error
            done(reportdailySaveErr);
          });
      });
  });

  it('should be able to update an Reportdaily if signed in', function (done) {
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

        // Save a new Reportdaily
        agent.post('/api/reportdailies')
          .send(reportdaily)
          .expect(200)
          .end(function (reportdailySaveErr, reportdailySaveRes) {
            // Handle Reportdaily save error
            if (reportdailySaveErr) {
              return done(reportdailySaveErr);
            }

            // Update Reportdaily name
            reportdaily.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Reportdaily
            agent.put('/api/reportdailies/' + reportdailySaveRes.body._id)
              .send(reportdaily)
              .expect(200)
              .end(function (reportdailyUpdateErr, reportdailyUpdateRes) {
                // Handle Reportdaily update error
                if (reportdailyUpdateErr) {
                  return done(reportdailyUpdateErr);
                }

                // Set assertions
                (reportdailyUpdateRes.body._id).should.equal(reportdailySaveRes.body._id);
                (reportdailyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Reportdailies if not signed in', function (done) {
    // Create new Reportdaily model instance
    var reportdailyObj = new Reportdaily(reportdaily);

    // Save the reportdaily
    reportdailyObj.save(function () {
      // Request Reportdailies
      request(app).get('/api/reportdailies')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Reportdaily if not signed in', function (done) {
    // Create new Reportdaily model instance
    var reportdailyObj = new Reportdaily(reportdaily);

    // Save the Reportdaily
    reportdailyObj.save(function () {
      request(app).get('/api/reportdailies/' + reportdailyObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', reportdaily.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Reportdaily with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/reportdailies/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Reportdaily is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Reportdaily which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Reportdaily
    request(app).get('/api/reportdailies/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Reportdaily with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Reportdaily if signed in', function (done) {
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

        // Save a new Reportdaily
        agent.post('/api/reportdailies')
          .send(reportdaily)
          .expect(200)
          .end(function (reportdailySaveErr, reportdailySaveRes) {
            // Handle Reportdaily save error
            if (reportdailySaveErr) {
              return done(reportdailySaveErr);
            }

            // Delete an existing Reportdaily
            agent.delete('/api/reportdailies/' + reportdailySaveRes.body._id)
              .send(reportdaily)
              .expect(200)
              .end(function (reportdailyDeleteErr, reportdailyDeleteRes) {
                // Handle reportdaily error error
                if (reportdailyDeleteErr) {
                  return done(reportdailyDeleteErr);
                }

                // Set assertions
                (reportdailyDeleteRes.body._id).should.equal(reportdailySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Reportdaily if not signed in', function (done) {
    // Set Reportdaily user
    reportdaily.user = user;

    // Create new Reportdaily model instance
    var reportdailyObj = new Reportdaily(reportdaily);

    // Save the Reportdaily
    reportdailyObj.save(function () {
      // Try deleting Reportdaily
      request(app).delete('/api/reportdailies/' + reportdailyObj._id)
        .expect(403)
        .end(function (reportdailyDeleteErr, reportdailyDeleteRes) {
          // Set message assertion
          (reportdailyDeleteRes.body.message).should.match('User is not authorized');

          // Handle Reportdaily error error
          done(reportdailyDeleteErr);
        });

    });
  });

  it('should be able to get a single Reportdaily that has an orphaned user reference', function (done) {
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

          // Save a new Reportdaily
          agent.post('/api/reportdailies')
            .send(reportdaily)
            .expect(200)
            .end(function (reportdailySaveErr, reportdailySaveRes) {
              // Handle Reportdaily save error
              if (reportdailySaveErr) {
                return done(reportdailySaveErr);
              }

              // Set assertions on new Reportdaily
              (reportdailySaveRes.body.name).should.equal(reportdaily.name);
              should.exist(reportdailySaveRes.body.user);
              should.equal(reportdailySaveRes.body.user._id, orphanId);

              // force the Reportdaily to have an orphaned user reference
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

                    // Get the Reportdaily
                    agent.get('/api/reportdailies/' + reportdailySaveRes.body._id)
                      .expect(200)
                      .end(function (reportdailyInfoErr, reportdailyInfoRes) {
                        // Handle Reportdaily error
                        if (reportdailyInfoErr) {
                          return done(reportdailyInfoErr);
                        }

                        // Set assertions
                        (reportdailyInfoRes.body._id).should.equal(reportdailySaveRes.body._id);
                        (reportdailyInfoRes.body.name).should.equal(reportdaily.name);
                        should.equal(reportdailyInfoRes.body.user, undefined);

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
      Reportdaily.remove().exec(done);
    });
  });
});
