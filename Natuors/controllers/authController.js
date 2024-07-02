const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const { promisify } = require('util')
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');


const signToken = id=>{
    //lets create a token (payload, secret, otheroptions) {id:newUser._id}
    return  jwt.sign({ id }, process.env.JWT_SECRET, {
        //user will fail to signup after specified time even its everything is correct       
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    // secure:true,
    httpOnly:true
}

if(process.env.NODE_ENV === 'production') cookieOptions.secure=true;
const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id)

    //send cookie
    res.cookie('jwt',token,cookieOptions)

    //hide password
    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user : user
        }
    })
}

exports.signup = catchAsync(async(req,res,next)=>{

    const newUser =  await User.create(req.body);
    createSendToken(newUser,201,res);
    
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
    createSendToken(user,200,res);
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


exports.forgotPassword = catchAsync( async (req,res,next) =>{
    
    // 1. Get user with mail from request
    const user = await User.findOne({ email : req.body.email});

    if(!user){
        return next(new AppError('The user with this email does not exist. Please check email once...',404));
    }

    //2. create a random reset token 
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});

    //send it to users email

    const resrtURL = `${req.protocal}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forgot your password? Submit a PATCH request with your new password and password confirmed to: ${resrtURL}\n
    If you did'nt  forget your password,Please ignore this email!!`

    try
    {
    await sendEmail({
        email:user.email,
        subject: 'Your password reset token (valid for 10min)',
        message
    })
    res.status(200).json({
        status:"success",
        message:'Token sent to email!!'
    })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});

        return next(new AppError('There was an error sending the email. Try again later!',500))
    }
})

exports.resetPassword = catchAsync(async (req,res,next)=>{

    //1) get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User
    .findOne({passwordResetToken : hashedToken, passwordResetExpires:{$gt:Date.now()}});

    // 2) only if token has not expired and there a user then set new password
        if(!user){
            return next(new AppError('Token is Invalid or has expired!!', 400));
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm ;
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;

        await user.save();

    // 3) update changedPasswordAt property for user 


    // 4) Log the user in , send JWT 
    createSendToken(user,200,res);

})


exports.updatePassword =   catchAsync(async(req,res,next)=>{
    //1) Get the user from collection 

    const user = await User.findById(req.user.id).select('+password'); 

    //2) Check if POSTED current password is corrrect 
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is Wrong',404));
    }

    //3) if so, update the password
    user.password =  req.body.password;
    user.passwordConfirm =  req.body.passwordConfirm;

    await user.save();

    //4) log user in , send JWT  
    createSendToken(user,200,res);
})