const express = require('express');
const authController = require('../controllers/auth.controllers');
const validator = require('../middlewares/register.validator.moddelware');
const { authUserMiddleware, authAdminMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();



// User Routes
router.post (
    '/user/register',
    validator.registerRules,
    validator.validateRequest,
    authController.registerUser
);
router.post ('/user/login', 
  authController.loginUser
);
router.get ('/user/logout', 
  authController.logoutUser
);

router.get('/profile', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access - No token provided"
    });
  }

  try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      
      const User = require('../models/user.model');
      let user = await User.findById(decoded.id).select('-password');
      if (user) {
        return res.json({ user });
      }
      
      const Admin = require('../models/admin.model');
      let admin = await Admin.findById(decoded.id).select('-password');
      
      if (admin) {
        return res.json({ user: admin }); 
      }
      
      return res.status(401).json({
        message: "Unauthorized Access - User not found"
      });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Session expired. Please login again"
      });
    }
    return res.status(401).json({
      message: "Unauthorized Access - Invalid token"
    });
  }
});

// Admin Routes
router.post (
    '/admin/register',
    validator.registerRules,
    validator.validateRequest,
    authController.registerAdmin,
    );
router.post ('/admin/login', 
  authController.loginAdmin,
);
router.get ('/admin/logout', 
  authController.logoutAdmin,
);


// Admin Profile
router.get('/admin/profile', authAdminMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});









module.exports = router;