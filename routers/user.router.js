const express = require('express');

let router = express.Router();

// Authentication & Authorization
const { authenticate, authorize } = require('../controllers/auth.controller.js');
router.use(authenticate);

// Usuário público
const {
	getMe,
	deleteMe,
	updateMePersonalData,
	updateMePassword,
	uploadUserPhoto,
	resizeUserPhoto,
} = require('../controllers/user.controller.js');

router.route('/me').get(getMe).delete(deleteMe);
router.route('/me/updatePersonalData').patch(uploadUserPhoto, resizeUserPhoto, updateMePersonalData);
router.route('/me/updatePassword').patch(updateMePassword);

// Apenas Administradores na área de usuário
router.use(authorize('admin'));

// Admininistração
const User = require('../models/user.schema.js');
const { genericGetApiFeatures, genericGetOne, genericDeleteOne } = require('../utils/response-factory.js');

router.route('/').get(genericGetApiFeatures(User));

router.route('/:id').get(genericGetOne(User)).delete(genericDeleteOne(User));

module.exports = router;
