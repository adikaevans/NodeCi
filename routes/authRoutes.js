const passport = require('passport');

module.exports = app => {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/blogs');
    }
  );

 /*  
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  Above code returned Error: 'req#logout requires a callback function'. This is coz 
  req.logout was changed to synchronous thus requires a callback function. We included an error-handling function for callback function as shown below.*/

  app.get('/auth/logout', function(req, res, next) {
    req.logout(function(err) {
      if(err) {return next(err);}
      res.redirect('/');
    });    
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
