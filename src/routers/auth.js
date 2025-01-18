import { Router } from 'express';
import {
  loginUserController,
  logoutController,
  refreshTokenController,
  registerUserController,
  resetPasswordController,
  sendResetEmailController,
  verifyController,
} from '../controllers/auth.js';
import {
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
  sendResetEmailSchema,
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';

const authRouter = Router();
authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
authRouter.get('/verify-email', ctrlWrapper(verifyController));
authRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);
authRouter.post('/refresh', ctrlWrapper(refreshTokenController));
authRouter.post('/logout', ctrlWrapper(logoutController));
authRouter.post(
  '/send-reset-email',
  validateBody(sendResetEmailSchema),
  ctrlWrapper(sendResetEmailController),
);
authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);
export default authRouter;
