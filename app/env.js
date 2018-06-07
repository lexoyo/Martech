const assert = require('assert');

const env = {
  nodeEnv: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'please set the SESSION_SECRET env var',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/fbwm',
  fbAppSecret: process.env.FB_APP_SECRET,
  fbTabPageAppSecret: process.env.FB_TAB_PAGE_APP_SECRET,
};

assert(!!env.fbAppSecret, 'FB_APP_SECRET env var required');
assert(!!env.fbTabPageAppSecret, 'FB_TAB_PAGE_APP_SECRET env var required');

module.exports = env;
