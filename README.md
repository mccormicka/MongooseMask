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

    maksedObj = {
        //ALL fields except _id and _private
    };

You can also call the mask explicitly

    var maskedModel = mongomask.mask(model, ['_id']);

Additionally there is also a expose method which you can use to expose items instead of excluding them.

Mask all values on a given object except for those that
are explicitly exposed through the values array. The value
can be a String which will directly be a one-to-one mapping
for example

        _id -> _id will expose the _id mongoose value

or an object that maps keys to values
for example
        {_id:'id'} will expose _id as id on the object.
    [ '_id', {_id:'id} ] will expose both id and _id

    var exposedModel = mongoosemask.expose(model, [{_id:'id'}, {'email':'username'}, 'name']);
     exposedModel = {
     id:12345,
     username:'my@email.com',
     name:'nodejs'
     }


#NOTE
If you are using 'express-partial-response' you must place this middleware
AFTER you place the express-partial-response middleware as this middlware only works
with mongoose objects which the express-partial-response middleware does not return

#0.0.2
Added support for calling mask directly.
Added expose() method as an inverse of mask.
 
#0.0.1
Initial release