const express = require('express')

const path = require('path')

const morgan = require('morgan')

const AppError = require('./utils/appError')

const rateLimit = require('express-rate-limit')

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize')

const xss = require('xss-clean')

const hpp = require('hpp')

const globalErrorHandler = require('./controllers/errorController')

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));


///////////////////////////////////////////////////////
// // Global Middlewares
//////////////////////////////////////////////////////

//serving static files
app.use(express.static(path.join(__dirname,'public')))


//secuity http headers
// app.use(helmet())

//development logging 
if(process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'))
    console.log(process.env.NODE_ENV);

}

const limiter = rateLimit({
    max:100, //max requst
    windowMs:60 * 60 * 1000, //per that much time    
    message:'To many requests from an IP please try again in an hour!!'
})

//rateLimit returs a middleWare
app.use('/api',limiter);

//Body parser, rading data from the body into req.body
app.use(express.json({limit:'10kb'}))

//Data sanitization against NOSQL query injection 
app.use(mongoSanitize());


//Data sanitization against XSS injection 
app.use(xss());

//prevent parameter pollution 
app.use(hpp({
    whitelist:[
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));



// Custom Middleware  it is going to run for all requests (test )
app.use((req,res,next)=>{
    
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
}) 



///////////////////////////////////////////////////////
// //Route 
//////////////////////////////////////////////////////

//in order to use it in different files (routes folder)
// one separate route for each resource



const tourRouter = require('./routes/tourRoutes');
const UserRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

//tourRouter.route('/').get(getTours).post(createTour)

//tourRouter.route('/:id').get(getTour).delete(delteTour).patch(updateTour)

// UserRouter.route('/').get(getAllUsers).post(createUser);
// UserRouter.route('/:id').get(getUser).patch(updateUser).delete(delteUser);

app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',UserRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/',viewRouter)

app.all('*',(req,res,next)=>{
   /* res.status(404).json({
        status:'fail',
        message: `Can't find ${req.originalUrl} on this URL`
    }); */

    /*const err = new Error(`Can't find ${req.originalUrl} on this URL`);
    err.status = 'fail';
    err.statusCode = 404;

    next(err);*/

    next(new AppError(`Can't find ${req.originalUrl} on this URL`),404 );
});


//Global middleware 
app.use(globalErrorHandler)

module.exports = app