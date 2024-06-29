const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const signToken = id=>{
    //lets create a token (payload, secret, otheroptions) {id:newUser._id}
    return  jwt.sign({ id }, process.env.JWT_SECRET, {
        //user will fail to signup after specified time even its everything is correct       
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async(req,res,next)=>{

    const newUser =  await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status:'success',
        token,
        data:{
            user : newUser
        }
    })
});



exports.login = catchAsync(async(req,res,next)=>{

    const {email,password} = req.body;

    //1) check if password and email exist
    if(!email || !password){
        return next(new AppError('Please provide email and password',400));
    }

    //2) check if user exist and password is correct
    //below {email:email} instead we wrote { email } #ES6 and for select it is projection because we disabled pass
    const user = await User.findOne({ email }).select('+password');
    

    if(!user || !await user.correctPassword(password,user.password)){
        return next(new AppError('Incorrect email or password',401)) //401 unauthorized
    }

    // 3) if everything is ok send token to the client
    const token = signToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })
});


exports.protect= catchAsync(async (req,res,next)=>{

    // 1) getting token and check of if its there
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1]; //split the string into array with space
    }

    console.log(token);

    if(!token){
        return next(new AppError('You are not logged in ! Please log in to get access',401))
    }


    //2) verificaiton token


    //3) check if user still exists

    // 4) check if user changed password after token was issued 


    next();
})