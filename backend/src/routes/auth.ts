import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken, validateRefreshToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import {
  loginSchema,
  signupSchema,
  changePasswordSchema,
} from '../utils/validation';

const router = Router();

// Public routes
router.post('/signup', validateBody(signupSchema), authController.signup);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

// Protected routes
router.use(authenticateToken);

router.get('/me', authController.getProfile);
router.put('/me', authController.updateProfile);
router.put('/change-password', validateBody(changePasswordSchema), authController.changePassword);
router.post('/logout', authController.logout);
router.delete('/deactivate', authController.deactivateAccount);

export default router;
