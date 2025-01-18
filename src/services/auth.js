import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/User.js';
import bcrypt from 'bcrypt';
import { SessionsCollection } from '../db/models/Session.js';
import { randomBytes } from 'crypto';
import {
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/users.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

const createSessionData = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: Date.now() + accessTokenLifetime,
  refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
});
export const sendResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );
  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = await fs.readFile(resetPasswordTemplatePath, 'utf-8');

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw err;
  }

  const user = await UsersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};

export const registerUser = async (payload) => {
  const { email } = payload;
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }
  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  const newUser = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
  const token = jwt.sign({ email }, getEnvVar('JWT_SECRET'), {
    expiresIn: '5m',
  });
  const verifyEmailTemplatePath = path.join(TEMPLATES_DIR, 'verify-email.html');
  const templateSource = await fs.readFile(verifyEmailTemplatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  const html = template({
    link: `${getEnvVar('APP_DOMAIN')}/verify-email?token=${token}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Verify email',
    html,
  });
  const userObject = newUser.toObject();
  delete userObject.password;

  return userObject;
};
export const verify = async (token) => {
  try {
    const { email } = jwt.verify(token, getEnvVar('JWT_SECRET'));
    const user = await UsersCollection.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'User not found');
    }
    await UsersCollection.findOneAndUpdate({ _id: user._id }, { verify: true });
  } catch (error) {
    throw createHttpError(401, error.message);
  }
};
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  if (!user.verify) {
    throw createHttpError(401, 'Email nor verified');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }
  await SessionsCollection.deleteOne({ userId: user._id });
  const sessionData = createSessionData();
  return SessionsCollection.create({
    userId: user._id,
    ...sessionData,
  });
};
export const refreshTokenUser = async (payload) => {
  const session = await SessionsCollection.findOne({
    _id: payload.sessionId,
    refreshToken: payload.refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  if (Date.now() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }
  await SessionsCollection.deleteOne({ _id: payload.sessionId });
  const sessionData = createSessionData();
  return SessionsCollection.create({
    userId: session.userId,
    ...sessionData,
  });
};
export const logout = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
export const getSession = (filter) => SessionsCollection.findOne(filter);
export const getUser = (filter) => UsersCollection.findOne(filter);
