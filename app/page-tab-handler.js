const env = require('./env');
const utils = require('./utils');
const pageTabModel = require('./page-tab-model');
const crypto = require('crypto');
const base64url = require('b64url');

module.exports = {
  securePageTabUrl: function(req, res, next) {
    // get the signed_request info from Facebook
    const signedRequest = req.body.signed_request;
    if(signedRequest) {
      const data = utils.parseSignedRequest(signedRequest, env.fbTabPageAppSecret);
      if(data) {
        console.log('parseSignedRequest, page info:', data.page, ', user id:', data.user_id);
        pageTabModel.get({
          fbPageId: data.page.id,
          // fbUserId: data.user_id,
        }).then(pageTab => {
          console.log('page tab:', pageTab);
          if(pageTab.length) {
            res.write(`
              <script>
                window.location = '${ pageTab[0].url }';
              </script>
            `);
          }
          else {
            res.write('Page tab not found.');
          }
          res.end();
        });
      }
      else {
        console.error('Bad signed JSON Signature! Is your app secret env var correct?');
        next();
      }
    }
    else {
      res.write('Not a tab in a Facebook page.');
      res.end();
    }
  /*
  stream the landing page:
    else {
      const url = `${ LANDING_PAGE_URL }${req.url}`;
      console.log('proxy', url);
      proxy(req, {
        url: url,
        onResponse: (response) => {
          console.log('onResponse', response.headers);
          if(response.headers['x-frame-options']) {
            delete response.headers['x-frame-options'];
          }
        }
      }, res);
    }
   */
  },
  getTabpages: function(req, res) {
    pageTabModel.get({
      fbUserId: req.session.fbUserId,
    }).then(pages => {
      console.log('get page tab:', pages);
      res.json(pages);
      res.end();
    });
  },
  createTabpage: function(req, res) {
    console.log('createTabpage', req.body, req.body.name);
    pageTabModel.create({
      fbUserId: req.session.fbUserId,
      name: req.body.name,
    }).then(page => {
      console.log('create page tab done:', page);
      res.json(page);
      res.end();
    });
  },
  updateTabpage: function(req, res) {
    const data = Object.assign({
      fbUserId: req.session.fbUserId,
    }, req.body); // FIXME: take only the needed params for security reasons
    console.log('updateTabpage', req.params.tabPageId, data);
    pageTabModel.update({
      _id: req.params.tabPageId,
      fbUserId: req.session.fbUserId,
    }, data).then(result => {
      console.log('update page tab done:', result);
      if(result.ok === 1) {
        res.json('OK');
      }
      else {
        res.status(400);
        res.json('KO');
      }
      res.end();
    });
  },
  addPageTabCallback: function (req, res) {
    // https://6261f953.ngrok.io/page-tab-callback/?tabs_added%5B1998131383849219%5D=1&tabs_added%5B1002713379903261%5D=1#_=_
    console.log('addPageTabCallback', req.query.tabs_added);
    const tabs = [];
    for(let tabId in req.query.tabs_added) {
      tabs.push(tabId);
    }
    res.write(`
      <script>
        window.parent.onPageTabAdded(${ JSON.stringify(tabs) });
      </script>
    `);
    res.end();
  },
}
