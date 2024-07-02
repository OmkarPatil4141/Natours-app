const express = require('express')

const morgan = require('morgan')

const AppError = require('./utils/appError')

const rateLimit = require('express-rate-limit')

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize')

const xss = require('xss-clean')

const hpp = require('hpp')

const globalErrorHandler = require('./controllers/errorController')

const app = express();





///////////////////////////////////////////////////////
// // Global Middlewares
//////////////////////////////////////////////////////


//secuity http headers
app.use(helmet())

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
        'duration'
    ]
}));


//serving static files
app.use(express.static(`${__dirname}/public`))

// Custom Middleware  it is going to run for all requests (test )
app.use((req,res,next)=>{
    
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
}) 


/*
//for routing
app.get('/',(req,res) =>{
    //we are just sending msg (string in above response)
    // res.status(200).send("Hello from the server side🥳")
    
    //we can send json just by json function
    res.status(200).json({message:"Hello from the server side🥳",app : "Natours"})

})

app.post('/',(req, res)=>{
    res.send('You can do post here🔥')
})

*/

/*const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

///////////////////////////////////////////////////////
// Route handlers for tours
//////////////////////////////////////////////////////
const getTours = (req,res)=>{
    console.log(req.requestTime);
    res.status(200).json({
        "status":"success",
        result : tours.length,
        data : {
            tours
        }
    })
}

const getTour = (req,res)=>{
    
    const id = req.params['id'] * 1; //as everything coming from object is string just typecasted
   // const id = req.params.id * 1;
   const tour = tours.find(ele => ele.id === id)
   if(!tour)
   {
       return res.status(400).json({            //return because only one response in order to invalid id
           status :"Fail",
           message : "Invalid Id"
       })
   }
   res.status(200).json({
       status :"suceess",
       data : {
           tour
       }
   })
}

const delteTour = (req,res)=>{

    if(req.params.id * 1 > tours.length)
    {
       return res.status(400).json({
            status : "failed",
            message : "invalid id"
        })
    }

    res.status(204).json({  //204 -> no content     
        status : "Success",
        data : null
    })
}

const updateTour = (req,res)=>{

    if(req.params.id * 1 > tours.length)
    {
       return res.status(400).json({
            status : "failed",
            message : "invalid id"
        })
    }

    res.status(200).json({
        status : "Success",
        data : {
            tour : "updated tour here "
        }
    })
}


const createTour = (req,res)=>{
    // console.log(req.body);
    // res.send('Done')
    const NewId = tours[tours.length-1].id + 1;
    const newTour = Object.assign({id : NewId}, req.body)
    tours.push(newTour)

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),(err)=>{
        //JSON.stringify(tours)
        //converts a JavaScript value to a JSON string, optionally replacing values if a replacer function 
        //is specified or optionally including only the specified properties if a replacer array is specified.
        res.status(201).json({
            status : "success",
            data : {
                tours : newTour
            }
        })
    })   
} */

///////////////////////////////////////////////////////
// Route handlers for user
//////////////////////////////////////////////////////

/*
const getAllUsers = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

const getUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

const createUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

const updateUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}

const delteUser = (req,res)=>{
    res.status(500).json({
        status : "fail",
        message : "This route is not yet iplemented"
    })
}
    
*/



///////////////////////////////////////////////////////
// Refactoring code 1
//////////////////////////////////////////////////////
/*
//get
app.get('/api/v1/tours',getTours);
//get by id
app.get('/api/v1/tours/:id',getTour)
//delete
app.delete('/api/v1/tours/:id',delteTour)
//update
app.patch('/api/v1/tours/:id',updateTour)
//create 
app.post('/api/v1/tours',createTour)

*/


///////////////////////////////////////////////////////
// Refactoring code 2
//////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// //Route 
//////////////////////////////////////////////////////

//in order to use it in different files (routes folder)
// one separate route for each resource
const tourRouter = require('./routes/tourRoutes');
const UserRouter = require('./routes/userRoutes');


//tourRouter.route('/').get(getTours).post(createTour)

//tourRouter.route('/:id').get(getTour).delete(delteTour).patch(updateTour)

// UserRouter.route('/').get(getAllUsers).post(createUser);
// UserRouter.route('/:id').get(getUser).patch(updateUser).delete(delteUser);

app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',UserRouter)

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