const pageTabHandler = require('./page-tab-handler');
const adminTabHandler = require('./admin-tab-handler');
const express = require('express');
const path = require('path');

module.exports = function(app) {
  app.all('/admin/', adminTabHandler.storeUserId);
  app.post('/admin/', adminTabHandler.post2Get);
  app.use('/admin', express.static(path.resolve(__dirname, '../pub/')));

  app.all('/page-tab/', pageTabHandler.securePageTabUrl);
  app.get('/page-tab-callback/', pageTabHandler.addPageTabCallback);
  
  app.use('/api/tabpage/', adminTabHandler.storeUserId);
  app.get('/api/tabpage/', pageTabHandler.getTabpages);
  app.post('/api/tabpage/', pageTabHandler.createTabpage);
  app.post('/api/tabpage/:tabPageId', pageTabHandler.updateTabpage);
  app.delete('/api/tabpage/:tabPageId', pageTabHandler.deleteTabpage);
  
  // called after first login to force user id
  app.post('/api/user/', adminTabHandler.updateUser);
}
