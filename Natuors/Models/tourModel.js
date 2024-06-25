const mongoose = require('mongoose')

const slugify = require('slugify')
const validator = require('validator')

const tourSchema = new mongoose.Schema({
    // name:String ---> we can specify in that way mongoose uses native javascript datatpes

    //we can also use schematypes in order to validation

    name:
    {
        type:String,
        required : [true,'A tour must have a name'],//it is a validator
        unique : true,
        trim:true,
        //validators
        maxlength:[40,'A tour have maximum length less than or equal to 40 characters'],
        minlength:[10,'A tour have minimum length more than or equal to 10 characters'],

        // validate:[validator.isAlpha,'The tour name should be in alphabets']
    },
    slug: String,
    duration:
    {
        type:Number,
        required : [true,'A tour must have a duration'],

    },
    maxGroupSize:
    {
        
        type:Number,
        required : [true,'A tour must have a Group size'],
    },
    difficulty:
    {
        type:String,
        required : [true,'A tour must have a difficulty'],
        //validator
        enum:{
                values:['easy','medium','difficult'],
                message:"Difficulty is either: easy , difficult or medium"
        }
    },

    ratingsAverage:
    {
        type:Number,
        default:4.5,
        //Validator
        min:[1.0, "Ratings must be above 1.0"],
        max:[5.0, "Ratings must be below 5.0"],
    },

    ratingsQuantity:
    {
        type:Number,
        default:0
    },

    price:
    {
        type:Number,
        required : [true,'A tour must have a price'],
    },

    priceDiscount:{
        type:Number,
        validate:{
        validator:function(val){
                //this only points to current doc on newly creation of doc
                return val < this.price
            },
            message:'Discount price({VALUE})should be below regular price'
        }
    },

    summary:
    {
        type:String,
        trim:true,
        required:[true,'A tour must have a description']

    },

    imageCover:{
        type:String,
        required: [true,'A tour must have a cover image']
    },

    images:[String],

    description:{
        type:String,
        trim:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates: [Date],

    secretTour:{
        type:Boolean
    }

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

//defining virtula parameters
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
})

//DOCUMENT middleware : runs before .save(), .create()

tourSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
});

/*
tourSchema.pre('save',function(next){
    console.log("Will save document.....");
    next();
});

//DOCUMENT middleware : runs after .save(), .create()
tourSchema.post('save',function(doc,next) {
    console.log(doc);
    next();
});
*/

//Query Middleware 

 
//it does not run for gettour as there is different handler and
//there we have used FindById() so instead of making different miidleware we can use regular expression
// tourSchema.pre('find',function(next){
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    this.start = Date.now();
    next();
})


tourSchema.post(/^find/, function(docs,next){
    // console.log(docs);
    // console.log(`Querry took ${Date.now()-this.start} milliseconds`);
    next();
})


//Aggregation middleware

tourSchema.pre('aggregate',function(next){
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    next();
})
//In order to use schema we have to use model
const Tour = mongoose.model('Tour',tourSchema)

module.exports = Tour;