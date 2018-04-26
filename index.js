// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const socketioJwt = require('socketio-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');

// Get gist route
const api = require('./server/routes/api');
const app = express();

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
// Socket.io for real time communication
const io = require('socket.io')(server);
const passportJwtSocketIo = require('passport-jwt.socketio')
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');

// Socket list
var sockets = [];

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static( __dirname + '/client/dist' ));

// Express session middleware
// app.use(session({
//   store: sessionStore,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.ENVIRONMENT !== 'development' && process.env.ENVIRONMENT !== 'test',
//     maxAge: 2419200000
//   },
//   secret: process.env.SECRET_KEY_BASE
// }));

// // Below express-session middleware
// // Pass just the user id to the passport middleware
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// // Reading your user base ont he user.id
// passport.deserializeUser(function(id, done) {
//   User.get(id).run().then(function(user) {
//     done(null, user.public());
//   });
// });

// Set our api routes
app.use(passport.initialize());
app.use(passport.session());

io.set('authorization', socketioJwt.authorize({
  secret: process.env.SECRET,
  handshake: true
}));

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

function expireTasks() {
  let searchDate = new Date();

  Task.remove({
      expires: { $lte: new Date(searchDate.toISOString()) }
  }, function(err,tasks) {
      console.log('tasks updated');
      sendTasksUpdated();
    });
}

function sendTasksUpdated() {
  for (let socketObj of sockets) {
    socketObj['socket'].emit('tasks_updated');
  }
}

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 5);
var expireTasksJob = schedule.scheduleJob(rule, expireTasks);
expireTasks();

io.sockets.on('connection', function (socket) {
  console.log('****** Request ');
  console.log(socket.request.decoded_token._id);
  sockets.push({ user: socket.request.decoded_token._id, socket: socket });
  // console.log(socket.handshake.decoded_token.email, 'connected');
  // socket.on('event');
});