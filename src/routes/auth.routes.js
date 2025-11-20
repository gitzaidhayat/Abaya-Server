const express = require('express');
const authController = require('../controllers/auth.controllers');
const validator = require('../middlewares/register.validator.moddelware');
const { authUserMiddleware, authClothPartnerMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

// User Routes
router.post (
    '/user/register',
    validator.registerRules,
    validator.validateRequest,
    authController.registerUser
);
router.post ('/user/login', authController.loginUser);
router.get ('/user/logout', authController.logoutUser);

router.get('/profile', authUserMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Cloth Partner Routes
router.post (
    '/clothpartner/register',
    validator.registerRules,
    validator.validateRequest,
    authController.registerClothPartner
    );
router.post ('/clothpartner/login', authController.loginClothPartner);
router.get ('/clothpartner/logout', authController.logoutClothPartner);

// Cloth Partner Profile
router.get('/clothpartner/profile', authClothPartnerMiddleware, (req, res) => {
  res.json({ partner: req.clothPartner });
});









module.exports = router;