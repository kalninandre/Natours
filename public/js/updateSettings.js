import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
	try {
		const url = type === 'password' ? 'api/user/me/updatePassword' : 'api/user/me/updatePersonalData';

		console.log(data);
		const res = await axios.patch(url, data);

		if (res.data.status_code === 200) {
			showAlert('success', 'Dados atualizados com sucesso');
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};
