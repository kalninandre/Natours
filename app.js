// NPM
const express = require('express');
const limit_request_rate = require('express-rate-limit');
const helmet = require('helmet');
const mongo_sanitize = require('express-mongo-sanitize');
const xss_clean = require('xss-clean');
const path = require('path');
const cookie_parser = require('cookie-parser');
const cors = require('cors');

// Clases
const AppError = require('./utils/app-error.js');
const { CheckNonOperationalError } = require('./controllers/error.controller');

// Rotas
const view_router = require('./routers/view.router');
const auth_router = require('./routers/auth.router');
const user_router = require('./routers/user.router');
const tour_router = require('./routers/tour.router');
const review_router = require('./routers/review.router');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ limit: '10kb' }));
app.use(cookie_parser());
app.use(express.static(path.join(__dirname, 'public')));

// Coloca Headers que validam XSS e CRF
app.use(helmet({ contentSecurityPolicy: false }));

// Valida para não passar umas query de banco de dados no Mongo DB
app.use(mongo_sanitize());

// Valida para não passar nenhuma TAG HTML
app.use(xss_clean());

// Cors
app.use(cors());

// Access-Control-Allow-Origin
// Colocar o nome de onde o Front-End está hospedado
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors()); // Todas as rotas

// Faz o log de informações adicionais no caso de desenvolvimento
const morgan = require('morgan');
if (process.env.ENV == 'DEV') {
	app.use(morgan('dev'));
}

// Mostra os Cookies do site
// if (process.env.ENV == 'DEV') {
// 	app.use((req, res, next) => {
// 		console.log(req.cookies);
// 		next();
// 	});
// }

const api_limiter = limit_request_rate({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: 'Limite de requisições excedido, tente novamente em uma hora',
	standardHeaders: true,
	legacyHeaders: false,
});
app.use('/api', api_limiter);

app.use('/', view_router);
app.use('/api/auth', auth_router);
app.use('/api/user', user_router);
app.use('/api/tour', tour_router);
app.use('/api/review', review_router);

app.use('*', (req, res, next) => {
	const error = new AppError(`Não foi possível encontrar ${req.originalUrl} no servidor`, 404);
	next(error);
});

// Global error handler
app.use((error, req, res, next) => {
	error.statusCode = error.statusCode || 500;

	if (req.originalUrl.includes('api')) {
		if (process.env.ENV == 'DEV') {
			// console.error(error.stack); // Mostro onde foi o erro

			// Envio o erro como um todo
			res.status(error.statusCode).json({
				status: 'error',
				message: error.message,
				error: error,
			});
		} else if (process.env.ENV == 'PROD') {
			// console.error(error.stack); // Mostro onde foi o erro

			// Caso seja um erro advindo do AppError, mostro para o usuário, pois sei o que aconteceu (é operacional)
			if (error.isOperational) {
				res.status(error.statusCode).json({
					status: 'error',
					message: error.message,
				});
			} else {
				const error_handler = CheckNonOperationalError(error, req, res);

				if (!error_handler) {
					res.status(error.statusCode).json({
						status: 'error',
						message: 'Algo errado aconteceu',
					});
				}
			}
		}
	} else {
		res.status(error.statusCode).render('error', {
			title: `Algo errado aconteceu`,
			message: error.isOperational ? error.message : '',
		});
	}

	next();
});

module.exports = app;
