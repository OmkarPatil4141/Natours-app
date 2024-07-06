const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');

const Tour = require('../../Models/tourModel');
const Review = require('../../Models/reviewModel');
const User = require('../../Models/userModel');

// Load environment variables from .env file
dotenv.config({path: './../../config.env'});

console.log(process.env.DATABASE);

// const DB = "mongodb+srv://Omkar:FcGPGbv5NV3t4X$@cluster0.9g87d.mongodb.net/natours?retryWrites=true&w=majority&appName=Cluster0"

// Replace <password> with the actual password from the environment variable, URL-encoded
const DB = process.env.DATABASE.replace(
  '<password>',
  encodeURIComponent(process.env.DB_PASSWORD)
);


mongoose.connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log("DB connection successful✅........."))
  .catch(err => console.error('DB connection error:', err));

// Read file synchronously
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
    try {
        await Tour.create(tours); // create also works with array of objects
        await User.create(users, { validateBeforeSave: false }); // create also works with array of objects
        await Review.create(reviews); // create also works with array of objects
        console.log("Data successfully loaded🥳");
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

// Delete data from DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data deleted successfully🥳");
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

// Use command-line arguments to choose the operation
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

console.log(process.argv);
