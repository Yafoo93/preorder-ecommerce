function ensureAuth(req, res, next) {
    if (req.session.userId) {
      return next();
    }
    res.redirect('/login');
  }
  
  module.exports.ensureAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
      return next();
    }
    res.status(403).send('Access denied');
  };
  module.exports = ensureAuth;
  