const mongoose = require('mongoose');
const fs = require('fs');

const Tour = require('../../models/tour.schema');
const User = require('../../models/user.schema');
const Review = require('../../models/review.schema');

require('dotenv').config({ path: `${__dirname}/../../.env` });

const connection = process.env.DB_CONNECTION_STRING.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose.connect(connection).then(() => {
	console.log('Mongoose connected...');
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

async function import_data() {
	try {
		await Tour.create(tours);
		await User.create(users);
		await Review.create(reviews);

		console.log('Data successfully created');
		process.exit();
	} catch (error) {
		console.log(error);
		process.exit();
	}
}

async function delete_data() {
	try {
		await Tour.deleteMany();
		await User.deleteMany();
		await Review.deleteMany();

		console.log('Data successfully deleted');
		process.exit();
	} catch (error) {
		console.log(error);
		process.exit();
	}
}

console.log(process.argv);

if (process.argv[2] == '--import') {
	import_data();
} else if (process.argv[2] == '--delete') {
	delete_data();
}

// node ./dev-data/data/import-data --import
// node ./dev-data/data/import-data --delete
