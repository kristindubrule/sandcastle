// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');

var session = require('express-session');

// Sets up a session store with Redis
var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var sessionStore = new RedisStore({ client: redis.createClient() });

// Get gist route
const api = require('./server/routes/api');
const app = express();

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
// Socket.io for real time communication
var io = require('socket.io').listen(server);
var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static( __dirname + '/client/dist' ));

// Express session middleware
app.use(session({
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
    maxAge: 2419200000
  },
  secret: process.env.SECRET_KEY_BASE
}));

// Below express-session middleware
// Pass just the user id to the passport middleware
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Reading your user base ont he user.id
passport.deserializeUser(function(id, done) {
  User.get(id).run().then(function(user) {
    done(null, user.public());
  });
});

// Set our api routes
app.use(passport.initialize());
app.use(passport.session());

// io.use(passportSocketIo.authorize({
//   key: 'connect.sid',
//   secret: process.env.SECRET_KEY_BASE,
//   store: sessionStore,
//   passport: passport,
//   cookieParser: cookieParser
// }));

app.use('/api', api);

const schedule = require('node-schedule');

// rule.minute = 52;
var Task = require('./server/models/task');
var User = require('./server/models/user');
require('./server/routes/passport');

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.resolve("./client/dist/index.html"))
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '8000';
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  console.log(`API running on localhost:${port}`);
});

/**
 * Socket events
 */
// io.sockets.on('connection', function(socket){
//   function expireTasks() {
//     let searchDate = new Date();
//     Task.remove({
//         expires: { $lte: new Date(searchDate.toISOString()) }
//     }, function(err,tasks) {
//         socket.emit('tasks_updated', tasks);
//     });
//   }

//   console.log('Socket connected');
//   var rule = new schedule.RecurrenceRule();
//   rule.minute = new schedule.Range(0, 59, 5);
//   var expireTasksJob = schedule.scheduleJob(rule, expireTasks);
//   expireTasks();
// });

var eventSocket = io.of('/tasks');
// on connection event
eventSocket.on('connection', function(socket) {
  console.log('socket connected');
  // example 'event1', with an object. Could be triggered by socket.io from the front end
  socket.on('event1', function(eventData) {
      // user data from the socket.io passport middleware
    if (socket.request.user && socket.request.user.logged_in) {
      console.log(socket.request.user);
    }
  });
});