'use strict';

/**
 * Express Middleware to filter out Mongoose model attributes.
 * You pass an array of fields you do not want returned as part of
 * json or jsonp requests for example.
 * app.use(mongoosemask(['_id', '_privatefield']));
 * These will then be removed from your json objects before sending to the
 * client.
 *
 * ** NOTE
 * If you are using 'express-partial-response' you must place this middleware
 * AFTER you place the express-partial-response middleware as this middlware only works
 * with mongoose objects which the express-partial-response middleware does not return
 */

var _ = require('lodash');

exports = module.exports = function (values) {
    function wrap(original) {
        return function (obj) {
            var duplicate = module.exports.mask(obj, values);
            original(duplicate);
        };
    }

    return function (req, res, next) {
        res.json = wrap(res.json.bind(res));
        res.jsonp = wrap(res.jsonp.bind(res));
        next();
    };
};

/**
 * Expose all values on an object except for the masked items
 * passed in the values array.
 * @param obj
 * @param values
 * @returns {*}
 */
module.exports.mask = function mask(obj, values) {
    var duplicate = obj;
    if (_.isFunction(obj.toObject)) {
        duplicate = obj.toObject();
        _.each(values, function (value) {
            delete duplicate[value];
        });
    }
    return duplicate;
};

/**
 * Mask all values on a given object except for those that
 * are explicitly exposed through the values array. The value
 * can be a String which will directly be a one-to-one mapping
 * for example
 *     _id -> _id will expose the _id mongoose value
 * or an object that maps keys to values
 * for example
 *     {_id:'id'} will expose _id as id on the object.
 * [ '_id', {_id:'id} ] will expose both id and _id
 * @param obj
 * @param values
 * @returns {{}}
 */
module.exports.expose = function expose(obj, values){
    var duplicate = {};
    if (_.isFunction(obj.toObject)) {
        _.each(values, function (item) {
            if(_.isObject(item)){
                _.forIn(item, function(value, key){
                    duplicate[value] = obj[key];
                });
            }else{
                duplicate[item] = obj[item];
            }
        });
    }
    return duplicate;
};