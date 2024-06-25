const dotenv = require('dotenv')

dotenv.config({path:'./config.env'})

const mongoose = require('mongoose')

const app = require('./app')

// const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DB_PASSWORD)
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
app.listen(port,()=>{
    console.log(`Server is started on port ${port}............`);
})


