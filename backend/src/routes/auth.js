const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { loginSchema, registerSchema, refreshTokenSchema } = require('../utils/validation');

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', validateBody(refreshTokenSchema), authController.logout);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;