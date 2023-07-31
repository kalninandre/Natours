const pug = require('pug');
const nodemailer = require('nodemailer');
const html_to_text = require('html-to-text');

module.exports = class Email {
	constructor(email) {
		this.to = email;
		this.from = `André <${process.env.EMAIL_FROM}>`;
	}

	transport() {
		return nodemailer.createTransport({
			host: 'sandbox.smtp.mailtrap.io',
			port: process.env.MAILTRAP_PORT,
			auth: {
				user: process.env.MAILTRAP_USER,
				pass: process.env.MAILTRAP_PASSWORD,
			},
		});
	}

	async send(template, model) {
		const html = pug.renderFile(`${__dirname}/templates/${template}.pug`, { model });

		// 2) Opções do email
		const options = {
			to: this.to,
			from: this.from,
			subject: model.title,
			html,
			text: html_to_text.htmlToText(html),
		};

		// 3) Transporter
		await this.transport().sendMail(options);
	}

	// async sendWelcome() {
	// 	await this.send('welcome', 'Welcome to the Natours Family!');
	// }

	// async sendPasswordReset() {
	// 	await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
	// }
};
