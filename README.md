##MongooseMask

Express Middleware to filter out Mongoose model attributes.
You pass an array of fields you do not want returned as part of
json or jsonp requests.

##Install
To install the latest official version, use NPM:

    npm install mongoosemask --save

To run the tests and see what is supported run either of the following commands

    npm test
    grunt

##Usage

    app.use(mongoosemask(['_id', '_privatefield']));

The '_id' and the '_privatefield' will then be removed from your json objects before sending to the
client.

#NOTE
If you are using 'express-partial-response' you must place this middleware
AFTER you place the express-partial-response middleware as this middlware only works
with mongoose objects which the express-partial-response middleware does not return

#0.0.1
Initial release