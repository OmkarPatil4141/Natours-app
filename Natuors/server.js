const dotenv = require('dotenv')

// all the sync errors outsidde express app are handled here
process.on('uncaughtException', err=>{
    console.log(err);
    console.log('\nUNHANDLED Exception !!! 🔥  shutting down.......\n');
    console.log(err.name, err.message);
    process.exit(1);
})

dotenv.config({path:'./config.env'})

const mongoose = require('mongoose')

const app = require('./app')

const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD)

console.log(process.env.DATABASE);

mongoose//.connect(process.env.DATABASE_LOCAL,{
    .connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:true,
    useUnifiedTopology: true
}).then(() => console.log("DB connection successfull✅........."));

// console.log(process.env);
//we can start server in this way
const port = process.env.port || 3000;
const server = app.listen(port,()=>{
    console.log(`Server is started on port ${port}............`);
})


//unhandledException
// all the async errors outsidde express app are handled here
process.on('unhandledRejection',err =>{
    
    console.log('\nUNHANDLED REJECTION !!! 🔥  shutting down.......\n');
    console.log(err);
    console.log(err.name, err.message);
    //we have to also turn off server 
    server.close(()=>{
        process.exit(1);
    })
})






