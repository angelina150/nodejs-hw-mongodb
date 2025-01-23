import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';
import { readFile } from 'fs/promises';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

const PATH_JSON = path.join(process.cwd(), 'google-oauth.json');

const oauthConfig = JSON.parse(await readFile(PATH_JSON));

const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: oauthConfig.web.redirect_uris[0],
});

export const generateAuthUrl = () =>
  googleOAuthClient.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

export const validateCode = async (code) => {
  const response = await googleOAuthClient.getToken(code);
  if (!response?.tokens?.id_token)
    throw createHttpError(401, 'Google OAuth code invalid');
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: response.tokens.id_token,
  });
  return ticket;
};

export const getUserNameFromGoogle = (payload) => {
  if (payload.name) return payload.name;
  let username = '';
  if (payload.given_name) {
    username += payload.given_name;
  }
  if (payload.given_name && payload.family_name) {
    username += ` ${payload.family_name}`;
  }
  if (!payload.given_name && payload.family_name) {
    username = payload.family_name;
  }
  return username;
};
