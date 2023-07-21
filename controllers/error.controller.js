exports.CheckNonOperationalError = (error, req, res) => {
	try {
		//#region Validação dos campos da Model
		if (error.name == 'ValidationError') {
			const error_string = Object.values(error.errors)
				.map(i => i.message)
				.join(', ');

			res.status(error.statusCode).json({
				status: 'error',
				message: `Erro de validação do banco de dados encontrado. ${error_string}`,
			});
			return true;
		}
		//#endregion

		//#region Campos duplicados
		if (error.code == 11000) {
			var duplicates_strings_array = Object.entries(error.keyValue);
			duplicates_strings = duplicates_strings_array.map(i => `${i[0].toUpperCase()}: ${i[1]}`).join(', ');

			res.status(error.statusCode).json({
				status: 'error',
				message: `Campos duplicados - ${duplicates_strings}`,
			});
			return true;
		}
		//#endregion

		//#region  Token inválido
		if (error.name == 'JsonWebTokenError') {
			res.status(401).json({
				status: 'error',
				message: 'Token inválido, por favor, faça o log-in novamente',
			});
			return true;
		}
		//#endregion

		//#region Token expirado
		if (error.name == 'TokenExpiredError') {
			res.status(401).json({
				status: 'error',
				message: 'Sessão expirada, por favor, faça log-in novamente',
			});
			return true;
		}
		//#endregion

		return false;
	} catch (error) {
		return false;
	}
};
