const express = require('express');

let router = express.Router();

const { signup, login, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller.js');

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);

router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:reset_token').post(resetPassword);

module.exports = router;
