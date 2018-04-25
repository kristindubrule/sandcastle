const expireIncrement = 5;
const expireUnit = 'minutes';
const testing = true;

const express = require('express');
const router = express.Router();
var status = require('http-status');
var passport = require('passport');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sandcastle');
var Task = require('../models/task');
var User = require('../models/user');

const path = require('path');
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment-timezone');

// var jwt = require('express-jwt');
// var auth = jwt({
//   secret: process.env.SECRET,
//   userProperty: 'payload'
// });

router.get('/users', function(req, res) {
    User.find({}).sort([["createdAt",-1]]).exec(function(err,users) {
        if (err) {
            res.json({message: "Error", error: err });
        } else {
            res.json({message: "Success", users: users});
        }
    });
});

router.post('/register', function(req,res) {
    console.log('Adding user');
    let user = new User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.tasks = [];
    user.setPassword(req.body.password);
    user.save(function(err) {
        if (err) {
            console.log(user.errors);
            res.json({message: "Error", errors: user.errors});
        } else {
            let token = user.generateJwt();
            res.status(200);
            console.log('Saved user');
            res.json({message: "Success", token: token});
        }
    })
});

router.post('/login', function(req,res) {
    console.log('Logging in user');
    passport.authenticate('local', function(err, user, info) {
        let token;

        if (err) {
            res.status(404).json(err);
            return;
        }
        // If a user is found
        if(user){
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token" : token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);
});

router.get('/tasks/date', function(req,res) {
    let searchDate = new Date('4/24/2018');
    Task.find({ 
        added: { $lte: new Date(searchDate.toISOString()) }
    }, function(err,tasks) {
        res.json( { tasks: tasks });
    });
});

router.post('/users/:id/task', function(req,res) {
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

router.get('/users/:id/task', function(req,res) {
   User.findById({ _id: ObjectId(req.params.id) }).populate({path: 'tasks'}).exec(function(err,user) {
        if (err) {
            res.json({message: "Error", error: err });
        } else {
            res.json({message: "Success", tasks: user['tasks']});
        }
    });
});

router.delete('/users/:id/task/:taskId', function(req,res) {
    Task.findByIdAndRemove({_id: ObjectId(req.params.taskId), _user: ObjectId(req.params.id) }, function(err,author) {
        if (err) {
            res.json({message: "Error", error: err});
        } else {
            res.json({message: "Success"});
        }
    });
})

router.put('/users/:id/task/:taskId', function(req,res) {
    Task.findOne({_id: ObjectId(req.params.taskId)}, function(err,task) {
        if (err) {
            res.json({message: "Error", error: err});
        } else {
            task.taskText = req.body.taskText;
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

router.all("*", (req,res,next) => {
    res.sendFile(path.resolve("./client/dist/index.html"))
});

module.exports = router;