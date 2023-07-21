const mongoose = require('mongoose');
const Tour = require('./tour.schema');

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			required: [true, 'É necessário que uma análise apresente descrição'],
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'Uma análise deve pertecenter à uma viagem'],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Uma análise deve pertecenter à um usuário'],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' },
			},
		},
	]);
	// console.log(stats);

	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		});
	}
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post('save', function () {
	// this points to current review
	this.constructor.calcAverageRatings(this.tour);
});

// No caso de update ou delete, o tour pode não ser mais o mesmo no update, ou ser deletado por completo no delete, então
// armazeno ele no objeto (r) antes da query para não perder a referência e poder dar update no Tour posteriormente

reviewSchema.pre(/^findBy/, async function (next) {
	this.r = await this.findById(this._id);
	console.log(this.r);
	next();
});

reviewSchema.post('findById', async function () {
	await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
