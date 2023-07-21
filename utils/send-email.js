const nodemailer = require('nodemailer');
const AppError = require('./app-error');

const sendEmail = async function (options) {
	try {
		const transport = nodemailer.createTransport({
			host: 'sandbox.smtp.mailtrap.io',
			port: 2525,
			auth: {
				user: process.env.MAILTRAP_USER,
				pass: process.env.MAILTRAP_PASSWORD,
			},
		});

		const email_model = {
			from: 'André <abc@andre.io>',
			to: options.to,
			subject: options.subject,
			text: options.message,
		};

		await transport.sendMail(email_model);
	} catch (error) {
		throw new AppError(error.message, 500);
	}
};

module.exports = sendEmail;
