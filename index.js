// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');

// Get gist route
const api = require('./server/routes/api');
const app = express();

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
// Socket.io for real time communication
var io = require('socket.io').listen(server);

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
// app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static( __dirname + '/client/dist' ));

// Set our api routes
app.use(passport.initialize());

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
io.sockets.on('connection', function(socket){
  function expireTasks() {
    let searchDate = new Date();
    Task.remove({
        expires: { $lte: new Date(searchDate.toISOString()) }
    }, function(err,tasks) {
        socket.emit('tasks_updated', tasks);
    });
  }

  console.log('Socket connected');
  var rule = new schedule.RecurrenceRule();
  rule.minute = new schedule.Range(0, 59, 5);
  var expireTasksJob = schedule.scheduleJob(rule, expireTasks);
  expireTasks();
});