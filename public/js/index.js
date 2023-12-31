import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// DELEGATION
if (loginForm)
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	});

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
	userDataForm.addEventListener('submit', e => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('name', document.getElementById('name').value);
		formData.append('email', document.getElementById('email').value);
		formData.append('photo', document.getElementById('photo').files[0]);

		updateSettings(formData, 'data');
	});

if (userPasswordForm)
	userPasswordForm.addEventListener('submit', async e => {
		e.preventDefault();
		document.querySelector('.btn--save-password').textContent = 'Updating...';

		const old_password = document.getElementById('password-current').value;
		const new_password = document.getElementById('password').value;
		const confirm_new_password = document.getElementById('password-confirm').value;
		await updateSettings({ old_password, new_password, confirm_new_password }, 'password');

		document.querySelector('.btn--save-password').textContent = 'Save password';
		document.getElementById('password-current').value = '';
		document.getElementById('password').value = '';
		document.getElementById('password-confirm').value = '';
	});
