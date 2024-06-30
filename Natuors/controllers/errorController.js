
const AppError = require('./../utils/appError')


const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again!!',401);

const handleJWTError = () => new AppError('Invalid token. Please log in again!!!',401)

const handleCastErrorDB = (err)=>{
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message,400);
}

const handleDuplicateFieldsDB = err =>{
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    // console.log(value);
    const message = `Duplicate field value : ${value}.  please use another value!!`
    return new AppError(message,400)
}

const handleValidationErrorDB = err =>{

    const errors = Object.values(err.errors).map(el => el.message)

    const message  = `Invalid Input data : ${errors.join('. ')}`;
    return new AppError(message,400);
}




const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        error : err,
        message:err.message,
        stack:err.stack
    })
}

const sendErrorProd = (err,res)=>{
    //Operational or trusted erors : send message to the client
    if(err.isOperational == true)
    {
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
        });
    }
    // Programming or other unknown errors: dont send details to the client
    else
    {
        //1) Log error
        console.error('Error🔥',err);

        //2)sent a generic message
        res.status(500).json({
            status:'error',
            message:'something went very wrong'
        })
    }
    
}



module.exports = (err,req,res,next)=>{

    // console.log(err.stack);
    // console.log(process.env.NODE_ENV);
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'development')
    {
       
        sendErrorDev(err,res);
        
    }

    else if(process.env.NODE_ENV === 'production')
    {
        //destructure original err because dont make changes in middlewares err object
        let error = {...err, name:err.name, message:err.message , statusCode:err.statusCode};
        // console.log(err);
        // console.log(error.name);

        if(error.name === 'CastError') error = handleCastErrorDB(error);

        if(error.code === 11000 ) error = handleDuplicateFieldsDB(error);

        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);

        if(error.name === 'JsonWebTokenError') error = handleJWTError();

        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error,res);
        
    }

   
}