const User = require('../models/user.schema.js');
const AppError = require('../utils/app-error.js');
const bcrypt = require('bcrypt');

//#region Me
exports.getMe = async function (req, res, next) {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			throw new AppError(`Usuário #${req.user._id} não encontrado no servidor`, 400);
		}
		user.password = null; // Escondo a senha do usuário

		res.status(200).json({
			status_code: 200,
			data: {
				user,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.deleteMe = async function (res, res, next) {
	try {
		const user = await User.findByIdAndDelete(req.user._id);
		if (!user) {
			throw new AppError(`Usuário #${req.user._id} não encontrado no servidor`, 400);
		}

		res.status(204).json({
			status_code: 204,
			data: {
				message: `Usuário #${req.user._id} excluído com sucesso`,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.updateMePersonalData = async function (req, res, next) {
	try {
		const { name, photo, role } = req.body;

		if (req.body.password) {
			throw new AppError('Não é possível alterar nenhum tipo de senha nesta rotina', 400);
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			throw new AppError(`Usuário #${req.user._id} não encontrado no servidor`, 400);
		}

		user.name = name;
		user.photo = photo;
		await user.save({
			validateModifiedOnly: true,
		});

		const new_user_info = {
			name: user.name,
			photo: user.photo,
		};

		res.status(200).json({
			status_code: 200,
			data: {
				user: new_user_info,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.updateMePassword = async function (req, res, next) {
	try {
		const { old_password, new_password, confirm_new_password } = req.body;

		if (!old_password || !new_password || !confirm_new_password) {
			throw new AppError(`É necessário que todas as três senhas sejam informadas`, 400);
		}

		const user = await User.findById(req.user._id);
		if (!user) {
			throw new AppError(`Usuário #${req.user._id} não encontrado no servidor`, 400);
		}

		const check_passwords = await bcrypt.compare(old_password.toString(), user.password);
		if (!check_passwords) {
			throw new AppError('Senha atual inválida', 400);
		}

		if (new_password != confirm_new_password) {
			throw new AppError('A senha e confirmação de senha devem ser iguais', 400);
		}

		const hashed_password = await bcrypt.hash(new_password.toString(), 10);
		user.password = hashed_password;
		user.lastPasswordUpdate = Date.now() / 1000;

		await user.save({
			validateModifiedOnly: true,
		});

		res.status(200).json({
			status_code: 200,
			data: {
				message: 'Senha atualizada com sucesso',
			},
		});
	} catch (error) {
		next(error);
	}
};
//#endregion
