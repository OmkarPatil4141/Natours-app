const express = require('express')

//requiring route handlers (controllers)
const tourController = require('../controllers/tourController')

//mounting
const router = express.Router();

// router.param('id',tourController.checkId)

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
.get(tourController.getTours)
.post(tourController.createTour)
// .post(tourController.checkBody,tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.delete(tourController.delteTour)
.patch(tourController.updateTour)

module.exports = router