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

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/onlytoday');
const Schema = mongoose.Schema;

var validate = require('mongoose-validator')
var extend = require('mongoose-validator').extend
const ObjectId = require('mongodb').ObjectID;

const TaskSchema = new mongoose.Schema({
    text: { type: String, required:true, minlength:3 },
    added: { type: Date, required: true},
    expires: { type: Date, required: true },
    adder: { type: Schema.Types.ObjectId, ref: 'User' },
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true }
}, {timestamps: true});
const Task = mongoose.model('Task', TaskSchema);

const UserSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    tasks: [ { type: Schema.Types.ObjectId, ref: 'Task'} ]
}, {timestamps: true});
const User = mongoose.model('User', UserSchema);

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
    });
}

app.get('/users', function(req, res) {
    User.find({}).sort([["createdAt",-1]]).exec(function(err,users) {
        if (err) {
            res.json({message: "Error", error: err });
        } else {
            res.json({message: "Success", users: users});
        }
    });
});

app.post('/users', function(req,res) {
    console.log('Adding user');
    let user = new User(req.body);
    user.save(function(err) {
        if (err) {
            console.log(user.errors);
            res.json({message: "Error", errors: user.errors});
        } else {
            console.log('Saved user');
            res.json({message: "Success"});
        }
    })
});

app.get('/tasks/date', function(req,res) {
    let searchDate = new Date('4/24/2018');
    Task.find({ 
        added: { $lte: new Date(searchDate.toISOString()) }
    }, function(err,tasks) {
        res.json( { tasks: tasks });
    });
});

app.post('/users/:id/task', function(req,res) {
    User.findOne({_id: req.params.id}, function(err, user) {
        var task = new Task(req.body);
        if (testing) {
            var today = moment();
        } else {
            var today = moment().startOf('day');
        }
        task.added = today;
        task.expires = moment(today).add(expireIncrement, expireUnit);     
        task._user = user._id;
        task.adder = user._id;
        task.save(function (err) {
            if (err) {
                res.json({message: "Error", errors: task.errors});
            } else {
                user.tasks.push(task);
                user.save(function(err) {
                    if (err) {
                        res.json({message: "Error", errors: user.errors});
                    } else {
                        res.json({message: "Success"});
                    }
                })
            }
        })
    })
});

app.get('/users/:id/task', function(req,res) {
   User.findById({ _id: ObjectId(req.params.id) }).populate({path: 'tasks'}).exec(function(err,user) {
        if (err) {
            res.json({message: "Error", error: err });
        } else {
            res.json({message: "Success", tasks: user['tasks']});
        }
    });
});

app.delete('/users/:id/task/:taskId', function(req,res) {
    Task.findByIdAndRemove({_id: ObjectId(req.params.taskId), _user: ObjectId(req.params.id) }, function(err,author) {
        if (err) {
            res.json({message: "Error", error: err});
        } else {
            res.json({message: "Success"});
        }
    });
})

app.put('/users/:id/task/:taskId', function(req,res) {
    Task.findOne({_id: ObjectId(req.params.taskId)}, function(err,task) {
        if (err) {
            res.json({message: "Error", error: err});
        } else {
            task.text = req.body.text;
            task.status = req.body.status;
            console.log(task);
            task.save(function(err) {
                if (err) {
                    res.json({message: "Error", error: err});
                } else {
                    res.json({message: "Success"});
                }
            })
        }
    })
})

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