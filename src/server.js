import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import dotenv from 'dotenv';
import { getEnvVar } from './utils/getEnvVar.js';
import * as contactServices from './services/contacts.js';

dotenv.config();

export const setupServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/contacts', async (req, res) => {
    const data = await contactServices.getContacts();

    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data,
    });
  });
  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;
    const data = await contactServices.getContactById(contactId);
    if (!data) {
      res.status(404).json({
        message: 'Contact not found',
      });
      return;
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data,
    });
  });

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  app.use((req, res) => {
    res.status(404).json({
      message: 'Not found',
    });
  });
  const port = Number(getEnvVar('PORT', 3000));
  app.listen(port, function () {
    console.log(`Server is running on ${port} port`);
  });
};
