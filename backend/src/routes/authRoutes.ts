import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import {
  validateBody,
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  refreshSchema,
} from '../utils/validators';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/otp/request', validateBody(otpRequestSchema), authController.requestOtp);
router.post('/otp/verify', validateBody(otpVerifySchema), authController.verifyOtp);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);
router.post('/logout', validateBody(refreshSchema), authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
