const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const express = require('express');

const router = express.Router();

router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);
router.route('/forget-password').post(authController.forgetPassword);
router.route('/reset-password/:token').patch(authController.resetPassword);

router
  .route('/update-me')
  .patch(authController.protect, userController.updateMe);

router
  .route('/delete-me')
  .patch(authController.protect, userController.deleteMe);

router.route('/').get(userController.getAllUsers);

module.exports = router;
