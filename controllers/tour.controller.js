const Tour = require('../models/tour.schema');
const AppError = require('../utils/app-error');

exports.get_monthly_tours = async (req, res, next) => {
	try {
		const year = req.query.year * 1;

		const query = Tour.aggregate([
			{
				$unwind: '$startDates',
			},
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-30`),
					},
				},
			},
			{
				$group: {
					_id: { $month: '$startDates' },
					counter: { $sum: 1 },
					tours: { $push: '$name' },
				},
			},
			{
				$addFields: {
					month: '$_id', // Adiciono o mês
				},
			},
			{
				$project: {
					_id: 0, // Removo o _id único do banco
				},
			},
			{
				$sort: { month: 1, name: 1 }, // Ordeno
			},
		]);

		const tours = await query;

		res.status(200).json({
			status_code: 200,
			data: {
				tours,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.group_tours = async (req, res, next) => {
	try {
		const tours = await Tour.aggregate([
			{
				$match: { ratingsAverage: { $gte: 4.5 } },
			},
			{
				$group: {
					_id: '$difficulty',
					tours_counter: { $sum: 1 },
					ratingsQuantity: { $sum: '$ratingsQuantity' },
					max_price: { $max: '$price' },
					average_price: { $avg: '$price' },
					min_price: { $min: '$price' },
				},
			},
		]);

		res.status(200).json({
			status_code: 200,
			data: {
				tours,
			},
		});
	} catch (error) {
		next(error);
	}
};

// { startLocation:{ $geoWithin: { $centerSphere: [ [-118.113491, 34.111745], 0.043] }}  }

// /tours-in-radius/:distance/center/:latlong/unit/:unit
exports.getToursInRadius = async (req, res, next) => {
	try {
		const { distance, latlong, unit } = req.params;
		const [lat, lng] = latlong.split(',');

		const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // Raio da terra - km / milhas

		if (!lat || !lng) {
			next(new AppError('Por favor, informe uma latitude e longititude no formato lat,long', 400));
		}

		const tours = await Tour.find({
			startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
		});

		res.status(200).json({
			status: 'success',
			total_items: tours.length,
			data: {
				data: tours,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.getDistances = async (req, res, next) => {
	try {
		const { latlong, unit } = req.params;
		const [lat, lng] = latlong.split(',');

		const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

		if (!lat || !lng) {
			next(new AppError('Por favor, informe uma latitude e longititude no formato lat,long', 400));
		}

		const distances = await Tour.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [lng * 1, lat * 1],
					},
					distanceField: 'distance',
					distanceMultiplier: multiplier,
				},
			},
			{
				$project: {
					distance: 1,
					name: 1,
				},
			},
		]);

		res.status(200).json({
			status: 'success',
			data: {
				data: distances,
			},
		});
	} catch (error) {
		next(error);
	}
};
