'use strict';

describe('MongooseMask Tests', function () {

    var mongooseMask = require('../index');
    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost:3001/TestingDB');
    var Model = require('./Model')(mongoose);

    var request = require('supertest');
    var express = require('express');

    beforeEach(function (done) {
        mockgoose.reset();
        Model.create({publicField: 'Hello', privateField: 'World'}, function (err, result) {
            expect(result).not.toBeNull();
            if (result) {
                expect(result.publicField).toBe('Hello');
                expect(result.privateField).toBe('World');
            }
            done(err);
        });
    });

    afterEach(function (done) {
        //Reset the database after every test.
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {
        it('Be able to acquire index', function () {
            var test = require('../index');
            expect(test).not.toBeNull();
        });

        it('Return all fields when no mask applied', function (done) {
            var app = express();
            app.get('/model', function (req, res) {
                Model.findOne({}, function(err, result){
                    res.json(result);
                });
            });

            request(app)
                .get('/model')
                .end(function(err, result){
                    expect(result).not.toBeNull();
                    if(result){
                        expect(result.body._id).toBeDefined();
                        expect(result.body.publicField).toBe('Hello');
                        expect(result.body.privateField).toBe('World');
                    }
                    done(err);
                });
        });
    });

    describe('SHOULD NOT', function () {
        it('Return all fields when mask applied', function (done) {
            var app = express();
            app.use(mongooseMask(['privateField', '_id']));

            app.get('/model', function (req, res) {
                Model.findOne({}, function(err, result){
                    res.json(result);
                });
            });

            request(app)
                .get('/model')
                .end(function(err, result){
                    expect(result).not.toBeNull();
                    if(result){
                        expect(result.body._id).toBeUndefined();
                        expect(result.body.publicField).toBe('Hello');
                        expect(result.body.privateField).toBeUndefined();
                    }
                    done(err);
                });
        });
    });
});