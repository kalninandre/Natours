const mongoose = require('mongoose');

require('dotenv').config({ path: `${__dirname}/.env` });

const connection = process.env.DB_CONNECTION_STRING.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(connection).then(() => {
	console.log('Database connected...');
});

const app = require('./app.js');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});

process.on('SIGTERM', () => {
	console.log('SIGTERM - Fechando a conexão do servidor...');
	server.close(() => {
		console.log('Conexão com o servidor fechada com sucesso');
	});
});
