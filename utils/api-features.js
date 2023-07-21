class APIFeatures {
	constructor(query, parameters) {
		this.query = query;
		this.parameters = parameters;

		this.query_object = { ...parameters }; // Faço uma cópia do objeto para não mutar ele diretamente
	}

	// 1 - Faço um filtro no banco de dados
	filter() {
		// Remove as palavras chaves da URL
		const reserved_params = ['fields', 'sort', 'page', 'limit'];
		reserved_params.forEach(i => delete this.query_object[i]);

		let query_string = JSON.stringify(this.query_object);
		query_string = query_string.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
		query_string = JSON.parse(query_string);

		this.query = this.query.find(query_string);

		return this;
	}

	// 2 - Seleciono apenas os campos solicitados, caso não seja informado, retornar todo o objeto do banco
	select() {
		if (this.parameters.fields) {
			const fields = this.parameters.fields.split(',').join(' ');
			this.query = this.query.select(fields);
		} else {
			this.query = this.query.select('-__v');
		}
		return this;
	}

	// 3 - Ordeno a query
	sort() {
		if (this.parameters.sort) {
			const sort_array = this.parameters.sort.split(',').join(' ');
			this.query.sort(sort_array);
		} else {
			this.query.sort('-createdAt name');
		}
		return this;
	}

	// 4 - Faço a paginação
	paginte() {
		const page = this.parameters.page * 1 || 1;
		const limit = this.parameters.limit * 1 || 100;
		const skip = (page - 1) * limit;

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
