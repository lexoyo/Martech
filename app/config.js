const mongoose = require('mongoose');
const compression = require('compression');
const env = require('./env');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

/////////////////////////////////
// Mongo DB
/////////////////////////////////

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env.nodeEnv === 'development') {
  mongoose.set('debug', true);
}

mongoose.connect(env.mongoUri);

/////////////////////////////////
// Express
/////////////////////////////////

const app = express();
app.use(session({
  secret: env.sessionSecret,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
  }),
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.listen(env.port, () => console.info(`server started on port ${env.port}`));

module.exports = {
  app: app,
};
