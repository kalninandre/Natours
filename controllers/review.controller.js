const Tour = require('../models/tour.schema');
const Review = require('../models/review.schema');
const AppError = require('../utils/app-error');

const { isValidObjectId } = require('mongoose');

exports.getTourReviews = async function (req, res, next) {
	try {
		const tourId = req.params.tourId;

		if (!isValidObjectId(tourId)) {
			throw new AppError('Parâmetro inválido', 400);
		}

		const tour = await Tour.findById(tourId);
		if (!tour) {
			throw new AppError('Viagem não encontrada', 400);
		}

		// Agora que garanti que a viagem existe, verifico suas reviews
		const reviews = await Review.find({ tour: tourId });

		res.status(200).json({
			status_code: 200,
			tourId,
			data: {
				reviews,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.createTourReview = async function (req, res, next) {
	try {
		const tourId = req.params.tourId;

		if (!isValidObjectId(tourId)) {
			throw new AppError('Parâmetro inválido', 400);
		}

		const tour = await Tour.findById(tourId);
		if (!tour) {
			throw new AppError('Viagem não encontrada', 400);
		}

		// Adiciono o tour que veio do parâmetro para o body
		req.body.tour = tourId;

		// Caso não tenha passado um id no body, uso o mesmo usuário, caso este seja da área pública
		if (!req.body.user) {
			if (req.user.role == 'public' || req.user.role == 'admin') {
				req.body.user = req.user._id;
			} else {
				throw new AppError('É necessário que uma avaliação apresente um usuário', 400);
			}
		}

		const review = await Review.create(req.body);

		res.status(200).json({
			status_code: 200,
			data: {
				review,
			},
		});
	} catch (error) {
		next(error);
	}
};
