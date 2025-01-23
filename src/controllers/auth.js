import {
  registerUser,
  loginUser,
  refreshTokenUser,
  logout,
  sendResetToken,
  resetPassword,
  verify,
  loginOrRegisterWithGoogle,
} from '../services/auth.js';
import { generateAuthUrl } from '../utils/googleOAuth2.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
  res.cookie('sessionId', session.id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

export const registerUserController = async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data,
  });
};
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  setupSession(res, session);
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const refreshTokenController = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;
  const session = await refreshTokenUser({ refreshToken, sessionId });
  setupSession(res, session);
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logout(req.cookies.sessionId);
  }
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');
  res.status(204).send();
};
export const sendResetEmailController = async (req, res) => {
  await sendResetToken(req.body.email);
  res.json({
    message: 'Reset password email has been successfully sent.',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password has been successfully reset.',
    status: 200,
    data: {},
  });
};
export const verifyController = async (req, res) => {
  const { token } = req.query;
  await verify(token);
  res.json({
    status: 200,
    message: 'Email verified',
  });
};
export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWhithGoogleControler = async (req, res) => {
  const { code } = req.body;
  const session = await loginOrRegisterWithGoogle(code);
  setupSession(res, session);
  res.status(200).json({
    status: 200,
    message: 'Successfully login with Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
