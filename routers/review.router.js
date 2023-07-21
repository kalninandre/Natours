const express = require('express');

let router = express.Router();

// Authentication & Authorization
const { authenticate, authorize } = require('../controllers/auth.controller.js');
router.use(authenticate);

// Reviews
const {
	genericGetApiFeatures,
	genericGetOne,
	genericCreateOne,
	genericUpdateOne,
	genericDeleteOne,
} = require('../utils/response-factory.js');

const Review = require('../models/review.schema.js');

router.route('/').get(genericGetApiFeatures(Review)).post(authorize('public'), genericCreateOne(Review));

router
	.route('/:id')
	.get(genericGetOne(Review))
	.patch(authorize('public'), genericUpdateOne(Review))
	.delete(authorize('public'), genericDeleteOne(Review));

module.exports = router;
