const express = require('express')

//requiring route handlers (controllers)
const tourController = require('../controllers/tourController')

const authController = require('./../controllers/authController')

const reviewRouter = require('./../routes/reviewRoutes')


//mounting
const router = express.Router();

// router.param('id',tourController.checkId)



// router
// .route('/:tourId/reviews')
// .post(authController.protect,authController.restrictTo('user'),reviewController.createReview)

router.use('/:tourId/reviews',reviewRouter)

router
 .route('/monthly-plan/:year')
 .get(tourController.getMonthlyPlan)


router
 .route('/tour-stats')
 .get(tourController.getTourStats)

router
.route('/top-5-cheap')
.get(tourController.aliasTopTours,tourController.getTours)

router
.route('/')
.get(authController.protect,tourController.getTours)
.post(tourController.createTour)
// .post(tourController.checkBody,tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.delete(authController.protect, authController.restrictTo('admin','lead-guide'),tourController.deleteTour)
.patch(tourController.updateTour)




module.exports = router