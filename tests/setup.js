jest.setTimeout(30000); /* By default, jest allows 5 seconds for a test to pass or fail. We adjusted this to 30 seconds(30000ms) to allow us enough time for completing the tests we are running.*/

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise; /*By default, mongoose does NOT use its built-in Promise implementation. It expects us to specify one, so we specified NodeJs global Promise Object. */

/*mongoose.connect(keys.mongoURI, {useMongoClient: true});    // 'useMongoClient' is no longer supported. Mongoose 5 is using mongo client by default. We can use '{useNewUrlParser: true}'*/

mongoose.connect(keys.mongoURI); //mongoose connects to mongoURI based on the keys(dev.js or prod.js).
