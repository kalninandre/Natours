const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'É necessário que um nome seja informado'],
			unique: true,
			trim: true,
			maxlength: [40, 'É necessário que o nome tenha menos de 40 caracteres'],
			minlength: [10, 'É necessário que o nome tenha mais de 10 caracteres'],
		},
		duration: {
			type: Number,
			required: [true, 'É necessário que a duração seja informada'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'É necessário que o tamanho máximo do grupo de pessoas seja informado'],
		},
		difficulty: {
			type: String,
			required: [true, 'É necessário que uma dificuldade seja informado'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Valor inválido de dificuldade',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 3,
			min: [1, 'A avaliação precisa ser maior que 1.0'],
			max: [5, 'A avaliação precisa ser menor que 5.0'],
			set: val => Math.round(val * 10, 2) / 10,
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'É necessário que um preço seja informado'],
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator: function (value) {
					if (value >= this.price) {
						return false;
					}
					return true;
				},
				message: `O disconto ({VALUE}) não pode ser maior que o valor base (${this.price})`,
			},
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'É necessário que um resumo seja informado'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image'],
		},
		images: [String],
		startDates: [Date],
		secret: {
			type: Boolean,
			default: false,
		},
		startLocation: {
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number], // Latitude, Longitude
			address: String,
			description: String,
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number], // Latitude, Longitude
				address: String,
				description: String,
			},
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
		createdAt: {
			type: Date,
			default: Date.now() / 1000,
		},
	},
	{
		toJSON: {
			virtuals: true,
		},
		toObject: {
			virtuals: true,
		},
	}
);

tourSchema.virtual('durationInWeeks').get(function () {
	return this.duration / 7;
});

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id',
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -lastPasswordUpdate',
	});
	next();
});

// A palavra THIS se refere à query sendo montada
// tourSchema.pre(/^find/, function (next) {
// 	this.start = Date.now();
// 	next();
// });

// tourSchema.post(/^find/, function (docs, next) {
// 	var time = Date.now() - this.start;
// 	console.log(`${time}`);
// 	next();
// });

// tourSchema.pre('save', async function (next) {
// 	const guides_promise = this.guides.map(async i => {
// 		const user = User.findById(i);
// 		return user;
// 	});
// 	this.guides = await Promise.all(guides_promise);
// 	next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
