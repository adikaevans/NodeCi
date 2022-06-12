const mongoose = require('mongoose');
const User = mongoose.model('User'); // User model

module.exports = () => {
  return new User({}).save(); /* Notice we specified an empty Object coz we are not defining any User model properties(Schema) here e.g googleId, displayName - as seen in '/models/User.js' file. Thus, this function will automatically generate the data for us and return it as a resource.*/
}

