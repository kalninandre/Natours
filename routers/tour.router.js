const express = require('express');

let router = express.Router();

// Authentication & Authorization
const { authenticate, authorize } = require('../controllers/auth.controller.js');
router.use(authenticate);

// Tours
const Tour = require('../models/tour.schema.js');
const { getToursInRadius, getDistances, group_tours, get_monthly_tours } = require('../controllers/tour.controller.js');
const {
	genericGetApiFeatures,
	genericGetOne,
	genericCreateOne,
	genericUpdateOne,
	genericDeleteOne,
} = require('../utils/response-factory.js');

router.route('/tours-in-radius/:distance/center/:latlong/unit/:unit').get(getToursInRadius);
router.route('/distances/:latlong/unit/:unit').get(getDistances);

router
	.route('/')
	.get(genericGetApiFeatures(Tour, { path: 'reviews' }))
	.post(authorize('guide-lead'), genericCreateOne(Tour));

router
	.route('/:id')
	.get(genericGetOne(Tour, { path: 'reviews' }))
	.patch(authorize('guide-lead'), genericUpdateOne(Tour))
	.delete(authorize('guide-lead'), genericDeleteOne(Tour));

router.route('/group-tours').get(group_tours);

router.route('/get_monthly_tours').get(get_monthly_tours);

// Reviews
const { getTourReviews, createTourReview } = require('../controllers/review.controller.js');

router.route('/:tourId/reviews').get(getTourReviews).post(createTourReview);

module.exports = router;
