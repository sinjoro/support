'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var auth = require('../../auth/auth.service');
var User = require('../user/user.model');

var user1 = new User({
    provider: 'local',
    name: 'Fake User',
    email: 'test@test.com',
    password: 'password'
});
var user2 = new User({
    provider: 'local',
    name: 'Fake User2',
    email: 'test2@test.com',
    password: 'password'
});
var accessToken1 = {};
var accessToken2 = {};

describe('[API/MESSAGES]', function () {
    before(function (done) {
        User.remove(function () {
            user1.save(function (err, user) {
                accessToken1 = 'Bearer ' + auth.signToken(user._id, user.role);
                user1 = user;
                user2.save(function (err, user) {
                    accessToken2 = 'Bearer ' + auth.signToken(user._id, user.role);
                    user2 = user;
                    done(err);
                });
            });
        });
    });

    it('GET /api/messages/1:2 request to others\' messages should be forbidden', function (done) {
        request(app)
            .get('/api/messages/1:2')
            .set('Authorization', accessToken1)
            .expect(403)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    });
    it('should respond with JSON array', function (done) {
        var dialog = user1._id + ':' + user2._id;
        request(app)
            .get('/api/messages/' + dialog)
            .set('Authorization', accessToken1)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Array);
                done();
            });
    });
    it('should post a message', function (done) {
        request(app)
            .post('/api/messages/' + user2._id)
            .send({text: '</div>Pls help me'})
            .set('Authorization', accessToken1)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Object);
                res.body.text.should.be.equal('Pls help me');
                done();
            });
    });
    it('POST /api/messages/support should post a message to support', function (done) {
        var testMessage = 'That is message to support';
        request(app)
            .post('/api/messages/support')
            .send({text: testMessage})
            .set('Authorization', accessToken2)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                res.body.should.be.instanceof(Object);
                res.body.text.should.equal(testMessage);
                res.body.acceptor.should.equal('support')
                done();
            });
    });
    it("POST /api/messages/support2 should not post a message as such support doesn't exist", function (done) {
        var testMessage = 'That is message to support2';
        request(app)
            .post('/api/messages/support2')
            .send({text: testMessage})
            .set('Authorization', accessToken2)
            .expect(400)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    })
});
