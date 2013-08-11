##MongooseMask

Express Middleware to filter out Mongoose model attributes.
You pass an array of fields you do not want returned as part of
json or jsonp requests for example.
app.use(mongoosemask(['_id', '_privatefield']));
These will then be removed from your json objects before sending to the
client.

#NOTE
If you are using 'express-partial-response' you must place this middleware
AFTER you place the express-partial-response middleware as this middlware only works
with mongoose objects which the express-partial-response middleware does not return

#0.0.1
Initial release