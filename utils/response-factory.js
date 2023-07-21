const AppError = require('./app-error');
const APIFeatures = require('./api-features');
const { isValidObjectId } = require('mongoose');

exports.genericGetApiFeatures = function (model, populateOptions) {
	return async function (req, res, next) {
		try {
			const api_features = new APIFeatures(model.find(), req.query);
			api_features.filter().sort().select().paginte();

			if (populateOptions) {
				api_features.query.populate(populateOptions);
			}
			document = await api_features.query;

			res.status(200).json({
				status_code: 200,
				data: {
					total_items: document.length,
					document,
				},
			});
		} catch (error) {
			next(error);
		}
	};
};

exports.genericGetOne = function (model, populateOptions) {
	return async function (req, res, next) {
		try {
			if (!isValidObjectId(req.params.id)) {
				throw new AppError('O identificador não é considerado elegível para busca', 400);
			}

			const query = model.findById(req.params.id);

			if (populateOptions) {
				query.populate(populateOptions);
			}
			document = await query;

			if (!document) {
				throw new AppError(`Documento #${req.params.id} não encontrado`, 404);
			}

			res.status(200).json({
				status_code: 200,
				data: {
					document,
				},
			});
		} catch (error) {
			next(error);
		}
	};
};

exports.genericCreateOne = function (model) {
	return async function (req, res, next) {
		try {
			const document = new model(req.body);
			await document.save();

			res.status(201).json({
				status_code: 201,
				data: {
					document,
				},
			});
		} catch (error) {
			next(error);
		}
	};
};

exports.genericUpdateOne = function (model) {
	return async function (req, res, next) {
		try {
			const document = await model.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!document) {
				throw new AppError(`Documento #${req.params.id} não encontrado`, 404);
			}

			res.status(200).json({
				status_code: 200,
				data: {
					document,
				},
			});
		} catch (error) {
			next(error);
		}
	};
};

exports.genericDeleteOne = function (model) {
	return async function (req, res, next) {
		try {
			const document = await model.findByIdAndDelete(req.params.id);
			if (!document) {
				throw new AppError(`Documento #${req.params.id} não encontrado`, 404);
			}

			res.status(200).json({
				status_code: 200,
				data: {
					document,
				},
			});
		} catch (error) {
			next(error);
		}
	};
};
