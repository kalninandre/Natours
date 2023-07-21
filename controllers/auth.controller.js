const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/user.schema');
const AppError = require('../utils/app-error.js');
const sendEmail = require('../utils/send-email');

// #region Registro e Login
exports.signup = async function (req, res, next) {
	try {
		const { name, email, password, confirmPassword, role } = req.body;
		if (!email || !password) {
			throw new AppError('E-mail ou senha não informados', 400);
		}

		if (password != confirmPassword) {
			throw new AppError('É necessário que a confirmação de senha seja igual a senha informada', 400);
		}

		// Não permito cadastro de usuário administrador
		if (role == 'admin') {
			throw new AppError('Não é possível registrar um usuário como administrador do sistema', 400);
		}

		const hashed_password = await bcrypt.hash(password.toString(), 10);

		const user = await User.create({
			name: name,
			email: email,
			password: hashed_password,
			role: role,
		});

		const user_response = await User.find({ _id: user.id }, { _id: 1, name: 1, email: 1 });

		const token = createAndSendToken(res, user);

		res.status(201).json({
			status_code: 201,
			token,
			data: {
				user: user_response,
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.login = async function (req, res, next) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new AppError('E-mail ou senha não informados', 400);
		}

		const user = await User.findOne({ email }).select('_id password');
		if (!user) {
			throw new AppError('E-mail não encontrado', 400);
		}

		const check_passwords = await bcrypt.compare(password.toString(), user.password);
		if (!check_passwords) {
			throw new AppError('Senha inválida', 400);
		}

		const token = createAndSendToken(res, user);

		res.status(200).json({
			status_code: 200,
			token,
			data: {
				message: 'Log-in realizado com sucesso',
			},
		});
	} catch (error) {
		next(error);
	}
};
// #endregion

// #region Middlewares - Autenticação e Autorização
exports.authenticate = async function (req, res, next) {
	try {
		if (!req.headers || !req.headers.authorization) {
			throw new AppError('Usuário não está logado', 401);
		}

		if (!req.headers.authorization.startsWith('Bearer')) {
			throw new AppError('Autorização inválida', 401);
		}

		const response_token = req.headers.authorization.split(' ')[1];
		if (response_token == 'null') {
			throw new AppError('Token não encontrado', 401);
		}

		const decoded_token = jwt.verify(response_token, process.env.JWT_SECRET);

		// Verifica se o usuário ainda encontra-se no banco de dados
		const user = await User.findById(decoded_token._id);
		if (!user) {
			throw new AppError('Usuário não encontrado no servidor', 401);
		}

		// Preciso multiplicar por 1000 para transformar em UNIX
		var decoded_token_date = new Date(decoded_token.iat * 1000);

		// Verifica a útlima alteração de senha do usuário
		if (user.lastPasswordUpdate != null && decoded_token_date < user.lastPasswordUpdate) {
			throw new AppError('A senha foi alterada durante a sessão', 401);
		}

		req.user = user;

		next();
	} catch (error) {
		next(error);
	}
};

exports.authorize = function (...roles) {
	return async function (req, res, next) {
		try {
			if (req.user.role != 'admin' && !roles.includes(req.user.role)) {
				const roles_string = roles.join(', ');
				throw new AppError(`Usuário não possui autorização para entrar nesta página (${roles_string})`, 401);
			}
			next();
		} catch (error) {
			next(error);
		}
	};
};
// #endregion

// #region Esqueci minha senha
exports.forgotPassword = async function (req, res, next) {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email: email });
		if (!user) {
			throw new AppError('E-mail não cadastrado', 400);
		}

		// Gera uma string aleatória de 32 posições
		const random_string = crypto.randomBytes(32).toString('hex');
		const reset_token = crypto.createHash('sha256').update(random_string).digest('hex');

		user.passwordResetToken = reset_token;
		user.passwordResetTokenExpiration = Date.now() + 1000 * 60 * 10; // 10 minutos
		await user.save();

		const reset_url = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${random_string}`;
		const message = `Se você solicitou uma redefinição de senha, por favor, utilize o link a seguir: ${reset_url}. Caso não tenha sido você, por favor, desconsiderar este e-mail`;
		sendEmail({
			to: user.email,
			subject: 'Redefinição de senha',
			message,
		});

		res.status(200).json({
			status_code: 200,
			data: {
				reset_token: random_string,
				message: 'Por favor, verifique seu e-mail, uma mensagem foi enviada para atualizar sua senha',
			},
		});
	} catch (error) {
		next(error);
	}
};

exports.resetPassword = async function (req, res, next) {
	try {
		const { password, confirmPassword } = req.body;

		const reset_token = req.params.reset_token;
		const hashed_token = crypto.createHash('sha256').update(reset_token).digest('hex');

		// Verifico se existe algum Token no servidor
		const user = await User.findOne({ passwordResetToken: hashed_token });
		if (!user) {
			throw new AppError('Token inválido', 400);
		}

		// Verifico se a URL do usuário ainda é válida para redefinir a senha
		const now = Date.now() / 1000;
		if (user.passwordResetTokenExpiration < now) {
			throw new AppError('Esta URL não pode mais ser utilizada (tempo expirado para redefinição de senha)', 400);
		}

		// Verifico se as senhas são iguais
		if (password != confirmPassword) {
			throw new AppError(
				'A senha e confirmação de senha são diferentes, atualize a página e tente novamente',
				400
			);
		}

		user.password = await bcrypt.hash(password.toString(), 10);
		user.lastPasswordUpdate = Date.now();
		user.passwordResetToken = null;
		user.passwordResetTokenExpiration = null;
		await user.save();

		const token = createAndSendToken(res, user);

		res.status(200).json({
			status_code: 200,
			token,
			data: {
				message: 'Senha atualizada com sucesso',
			},
		});
	} catch (error) {
		next(error);
	}
};
// #endregion

//#region Token - Cookies
function createAndSendToken(res, user) {
	try {
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRATION,
		});

		const options = {
			expires: new Date(Date.now() + 1000 * 60 * 60), // uma hora de expiração
			httpOnly: true,
		};

		if (process.env.ENV == 'PROD') {
			options.secure = true;
		}

		res.cookie('natours-jwt', token, options);

		return token;
	} catch (error) {
		throw new AppError(error.message, 400);
	}
}
//#endregion
