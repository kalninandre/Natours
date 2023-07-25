const AppError = require('../utils/app-error');
const Tour = require('../models/tour.schema');
const User = require('../models/user.schema');

exports.getMainPage = async (req, res, next) => {
	try {
		const tours = await Tour.find();

		res.status(200).render('overview', {
			title: 'Viagens',
			tours,
		});
	} catch (error) {
		next(error);
	}
};

exports.getTour = async (req, res, next) => {
	try {
		const tour = await Tour.findOne({ _id: req.params.id }).populate({
			path: 'reviews',
			fields: 'review rating user',
		});

		if (!tour) {
			return new AppError('Não há nenhuma viagem com este nome', 404);
		}

		res.status(200).render('tour', {
			title: `${tour.name} Tour`,
			tour,
		});
	} catch (error) {
		next(error);
	}
};

exports.getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Log into your account',
	});
};

exports.getAccount = (req, res) => {
	res.status(200).render('account', {
		title: 'Your account',
	});
};

exports.updateUserData = async (req, res, next) => {
	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		{
			name: req.body.name,
			email: req.body.email,
		},
		{
			new: true,
			runValidators: true,
		}
	);

	res.status(200).render('account', {
		title: 'Your account',
		user: updatedUser,
	});
};
