const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'Please enter a username'] },
    email: { type: String, required: [true, 'Please enter an email'] },
    hash: { type: String, required: [true, 'Please enter a password that is at least 6 characters, contains at least one digit, one lowercase character and one uppercase character'] },
    salt: { type: String },
    tasks: [ { type: Schema.Types.ObjectId, ref: 'Task'} ]
}, {timestamps: true});

UserSchema.methods.checkPassword = function(str) {
    var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return re.test(str);
}

UserSchema.methods.setPassword = function(password){
    if (this.checkPassword(password)) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    }
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};
  
UserSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
    }, process.env.SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

UserSchema.methods.public = function() {
    delete this.hash;
    delete this.salt;
    return this;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;