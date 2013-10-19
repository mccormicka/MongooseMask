'use strict';

describe('MongooseMask Tests', function () {

    var mongooseMask = require('../index');
    var mockgoose = require('mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    mongoose.createConnection('mongodb://localhost:3001/TestingDB');
    var Model = require('./Model')(mongoose);
    var ModelNested = require('./ModelNested')(mongoose, Model);

    var request = require('supertest');
    var express = require('express');
    var _ = require('lodash');

    var baseModel;
    beforeEach(function (done) {
        mockgoose.reset();
        Model.create({publicField: 'Hello', privateField: 'World'},
            {publicField: 'Hello', privateField: 'World'}, function (err, result) {
                baseModel = result;
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

        it('Return all fields when no mask applied middleware', function (done) {
            var app = express();
            app.get('/model', function (req, res) {
                Model.findOne({}, function (err, result) {
                    res.json(result);
                });
            });

            request(app)
                .get('/model')
                .end(function (err, result) {
                    expect(result).not.toBeNull();
                    if (result) {
                        expect(result.body._id).toBeDefined();
                        expect(result.body.publicField).toBe('Hello');
                        expect(result.body.privateField).toBe('World');
                    }
                    done(err);
                });
        });

        it('Return all fields if no mask applied', function (done) {
            Model.findOne({}, function (err, result) {
                expect(result._id).toBeDefined();
                expect(result.publicField).toBe('Hello');
                expect(result.privateField).toBe('World');
                done(err);
            });
        });

        it('Mask all items in an array', function (done) {
            Model.find({}, function (err, results) {
                results = mongooseMask.mask(results, ['_id', 'privateField']);
                expect(results.length).toBe(2);
                _.each(results, function (result) {
                    expect(result._id).toBeUndefined();
                    expect(result.publicField).toBe('Hello');
                    expect(result.privateField).toBeUndefined();
                });
                done(err);
            });
        });

        it('Mask fields if mask applied', function (done) {
            Model.findOne({}, function (err, result) {
                result = mongooseMask.mask(result, ['_id', 'privateField']);
                expect(result._id).toBeUndefined();
                expect(result.publicField).toBe('Hello');
                expect(result.privateField).toBeUndefined();
                done(err);
            });
        });

        it('Be able to expose explicit fields', function (done) {
            Model.findOne({}, function (err, result) {
                result = mongooseMask.expose(result, ['_id', 'privateField']);
                expect(result._id).toBeDefined();
                expect(result.publicField).toBeUndefined();
                expect(result.privateField).toBeDefined();
                done(err);
            });
        });

        it('Be able to expose explicit fields on array', function (done) {
            Model.find({}, function (err, results) {
                results = mongooseMask.expose(results, ['_id', 'privateField']);
                expect(results.length).toBe(2);
                _.each(results, function (result) {
                    console.log('Result', result);
                    expect(result._id).toBeDefined();
                    expect(result.publicField).toBeUndefined();
                    expect(result.privateField).toBeDefined();
                });
                done(err);
            });
        });

        it('Be able to rename exposed fields', function (done) {
            Model.findOne({}, function (err, result) {
                result = mongooseMask.expose(result, [
                    {'_id': 'banana'},
                    'privateField'
                ]);
                expect(result._id).toBeUndefined();
                expect(result.banana).toBeDefined();
                expect(result.publicField).toBeUndefined();
                expect(result.privateField).toBeDefined();
                done(err);
            });
        });

        it('Be able to pass a callback to the mask middleware for complex data', function (done) {
            ModelNested.create({
                publicField: 'public',
                privateField: 'private',
                data: {publicField: 'public',
                    privateField: 'private' },
                nestedDoc:[{
                    publicField: 'public',
                    privateField: 'private'
                }]
            }, function (err, result) {
                expect(err).toBeNull();

                var middleware = mongooseMask(function (obj, mask, done) {
                    console.log('calling mask', obj);
                    var masked = mask(obj, ['_id', 'privateField']);
                    console.log('calling mask', masked);
                    masked.data = mask(obj.data, ['_id', 'privateField']);
                    masked.nestedDoc = mask(obj.nestedDoc, ['_id', 'privateField']);
                    console.log('calling mask', masked);
                    done(null, masked);
                });
                var req = {};
                var response;
                var res = {
                    json: function (data) {
                        response = data;
                        return data;
                    },
                    jsonp:function(){}
                };
                middleware(req, res, function () {
                    res.json(result);
                    expect(response).toEqual(
                        { publicField : 'public', data : { publicField : 'public' }, nestedDoc : [ { publicField : 'public' } ] }
                    );
                    done();
                });

            });
        });
    });

    describe('SHOULD NOT', function () {

        it('Return all fields when mask applied middleware', function (done) {
            var app = express();
            app.use(mongooseMask(['privateField', '_id']));

            app.get('/model', function (req, res) {
                Model.findOne({}, function (err, result) {
                    res.json(result);
                });
            });

            request(app)
                .get('/model')
                .end(function (err, result) {
                    expect(result).not.toBeNull();
                    if (result) {
                        expect(result.body._id).toBeUndefined();
                        expect(result.body.publicField).toBe('Hello');
                        expect(result.body.privateField).toBeUndefined();
                    }
                    done(err);
                });
        });
    });
});