import { showAlert } from './alerts.js';

export const login = async (email, password) => {
	try {
		const res = await axios.post('api/auth/login', {
			email,
			password,
		});

		if (res.data.status_code === 200) {
			showAlert('success', 'Logged in successfully');
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	} catch (err) {
		console.log(err);
		showAlert('error', err.response.data.message);
	}
};

export const logout = async () => {
	try {
		const res = await axios.get('api/auth/logout');

		if (res.data.status_code === 200) {
			location.assign('/login');
		}
	} catch (err) {
		showAlert('error', 'Error logging out! Try again.');
	}
};
