const authController = require('./../controllers/authController');
const express = require('express');
router = express.Router();
  
router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);

module.exports = router;
