const expireIncrement = 10;
const expireUnit = 'minutes';
const testing = true;

// Require the Express Module
const express = require('express');
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const app = express();
var http = require('http').Server(app);

// Require body-parser (to receive post data from clients)
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static( __dirname + '/client/dist' ));

// Require path
const path = require('path');
app.use(express.static(path.join(__dirname, './static')));

mongoose.connect('mongodb://localhost/sandcastle');

// Use native promises
mongoose.Promise = global.Promise;

var rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 5);
// rule.minute = 52;
var expireTasksJob = schedule.scheduleJob(rule, expireTasks);

function expireTasks() {
    let searchDate = new Date();
    Task.remove({
        expires: { $lte: new Date(searchDate.toISOString()) }
    }, function(err,tasks) {
        socket.emit('tasks_updated', tasks);
    });
}

// Expiration function
// Tasks are saved with UTC time
// Need to delete all tasks that were created yesterday
// Yesterday needs to take into account the user's local time (given by offset?)
// Where today's local date (no time) - task's local date (no time) >= 1
function localdate(timezone, d) {
    if (d == undefined) { d = new Date(); } // current date/time
    if (timezone == undefined) { timezone = moment.tz.guess() }
    return Number( moment(d).tz(timezone).format("YYYYMMDD") );
}

var io = require('socket.io')(http);
io.sockets.on('connection', function (socket) {
    console.log("Client/socket id is: ", socket.id, " user id is ", socket.userid);
})

app.all("*", (req,res,next) => {
    res.sendFile(path.resolve("./client/dist/index.html"))
  });


// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    expireTasks();
    console.log("listening on port 8000");
})