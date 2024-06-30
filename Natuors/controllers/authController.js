const jwt = require('jsonwebtoken');
const { promisify } = require('util')
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
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt
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

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) check if user still exists

    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next(new AppError('The user belonging to this token does not longer exist',401));
    }

    // 4) check if user changed password after token was issued 

    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password. Please log in again', 401));
    }

    //grant access to protected route
    req.user = currentUser;
    next();
})



exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        //roles ['admin, 'lead-guide]. 

        if(!roles.includes(req.user.role))//role = user
        {
            return next(new AppError('You do not have permissions to perform that action',403))
        }

        next();
    }

    
}