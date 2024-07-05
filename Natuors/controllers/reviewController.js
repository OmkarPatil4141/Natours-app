
const Review = require('./../Models/reviewModel');

// const catchAsync = require('./../utils/catchAsync');

const factory = require('./handleFactory')



exports.setTourUserIds = (req,res,next)=>{
    // if they are not specified in request body

    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next()
}

exports.getAllReviews = factory.getAll(Review)
exports.createReview = factory.createone(Review)
exports.getReview = factory.getone(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review);