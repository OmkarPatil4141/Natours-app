const mongoose = require('mongoose');
const validator = require('validator');
const { validate } = require('./tourModel');
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,'A user must have a name'],
    },

    email:{
        type:String,
        required:[true,'Please provide your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']
    },

    photo:String,

    role: {
       
        type : String,
        enum : ['user', 'guide', 'lead-guide','admin'],
        default : 'user'

    },

    password:{
        
        type:String,
        required:[true,'Please provide a password'],
        minlength: 8,
        select:false //do not show password to user

    },

    passwordConfirm:{
        type:String,
        required:[true,'Please confirm your password'],
        // cutsom validator runs only on .save and .create
        validate:{
            validator:function(el){
                return el === this.password;
            },
            message: 'password does not matching'
        }
    },

    passwordChangedAt: Date

})

//lets encrypt the password

userSchema.pre('save', async function(next){

    // if password is modified then only run
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12) //that cost parameter is CPU intensive

    //delete PasswordConfirm field (required to input not persisted to database)
    this.passwordConfirm = undefined;
    next();


})

//Comparing passwords

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    
    return await bcrypt.compare(candidatePassword,userPassword);
}

// checking changed password or not
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){

    

    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        return JWTTimestamp < changedTimestamp; // 100 < 200
    }

    //false means not changed passsword
    return false;
}

const User = mongoose.model('User',userSchema);

module.exports = User;