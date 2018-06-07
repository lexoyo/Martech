const env = require('./env');
const utils = require('./utils');
const pageTabModel = require('./page-tab-model');

module.exports = {
  storeUserId: function(req, res, next) {
    console.log('storeUserId');
    // get the signed_request info from Facebook
    const signedRequest = req.body.signed_request;
    if(signedRequest) {
      const data = utils.parseSignedRequest(signedRequest, env.fbAppSecret);
      if(data) {
        console.log('parseSignedRequest, page info:', data.page, ', user id:', data.user_id);
        // store user ID
        req.session.fbUserId = data.user_id;
      }
      next();
    }
    else {
      res.write('Not a tab in a Facebook page.');
      res.end();
    }
  },
  post2Get: function (req, res, next) {
    req.method = 'GET'
    next()
  }
}
