const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {  //This is the function we will call whenever we create a new session.
  const sessionObject = {
    passport: {
    user: user._id.toString() /*user id corresponds to the new user(from userFactory) model as above.
NB: The mongoose user model id property(user._id) is NOT actually a string rather a javaScript Object that contains a user id. There4 b4 we turn it into a JSON(as below), we HAVE to first convert it into a string using 'toString()' function. */
    }
  };
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
  
  const sig = keygrip.sign('session=' + session);

  return{ session, sig} ; // Object is ok, though we could also return an Array that contains both.

 //console.log(session, sig);
}

/* => Decrypting cookie session string(inspect browser) to reveal the User id:
* From the terminal, type 'node'
  const session = 'enter the session string'
  const Buffer = require('safe-buffer').Buffer
  Buffer.from(session, 'base64').toString('utf8')
    //This will return the user id as string e.g '{"passport":{"user":"6269254e35d4bebbb4e1d6d6"}}'
    
=> To Retrieve the session signature(A signature to authenticate the validity of session string):
  const session = 'enter the session string'
  const Keygrip = require('keygrip') //module for signing and verifying data.
  const keygrip = new Keygrip(['enter our secret cookiekey e.g from our dev.js file'])
  keygrip.sign('session=' + session)
    //Prints-out the session signature. Note the uppercase and lowercase 'K' in our variables.
    
=> To verify the session signature:
  keygrip.verify('session=' + session, 'enter the above session signature') 
*/

