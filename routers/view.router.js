const express = require('express');

const router = express.Router();

const { getMainPage, getTour, getLoginForm, getAccount, updateUserData } = require('../controllers/view.controller');
const { authenticate } = require('../controllers/auth.controller.js');

router.get('/', authenticate, getMainPage);
router.get('/tour/:id', authenticate, getTour);
router.get('/login', getLoginForm);
router.get('/me', authenticate, getAccount);

module.exports = router;
