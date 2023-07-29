const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Um nome deve ser informado'],
		trim: true,
	},
	email: {
		type: String,
		required: [true, 'Um e-mail deve ser informado'],
		unique: true,
		trim: true,
		lowercase: true,
		validate: [validator.isEmail, 'Por favor, informe um e-mail válido'],
	},
	photo: {
		type: String,
		default: 'default.jpg',
	},
	password: {
		type: String,
		required: [true, 'Uma senha deve ser informada'],
		trim: true,
	},
	role: {
		type: String,
		enum: ['public', 'guide', 'guide-lead', 'admin'],
		default: 'public',
	},
	passwordResetToken: {
		type: String,
		default: null,
	},
	passwordResetTokenExpiration: {
		type: Date,
		default: null,
	},
	lastPasswordUpdate: {
		type: Date,
		default: null,
	},
	isBlocked: {
		type: Boolean,
		default: false,
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
