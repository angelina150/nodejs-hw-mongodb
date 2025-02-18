import createError from 'http-errors';
import * as contactServices from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { sortByList } from '../db/models/Contact.js';
import { saveFileToUploadsDir } from '../utils/saveFileToUploadsDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query, sortByList);
  const { _id: userId } = req.user;
  const data = await contactServices.getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    userId,
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { contactId: _id } = req.params;
  const data = await contactServices.getContact({ _id, userId });
  if (!data) {
    throw createError(404, 'Contact not found');
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${_id}!`,
    data,
  });
};

export const addContactController = async (req, res) => {
  const cloudinaryEnable = getEnvVar('CLOUDINARY_ENABLE') === 'true';
  let photo;
  if (req.file) {
    if (cloudinaryEnable) {
      photo = await saveFileToCloudinary(req.file);
    } else {
      photo = await saveFileToUploadsDir(req.file);
    }
  }
  const { _id: userId } = req.user;
  const data = await contactServices.addContact({ ...req.body, photo, userId });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const updateContactController = async (req, res) => {
  const { contactId: _id } = req.params;
  const { _id: userId } = req.user;
  const data = await contactServices.updateContact(
    { _id, userId },
    {
      ...req.body,
      userId,
    },
  );
  if (!data) {
    throw createError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId: _id } = req.params;

  const { _id: userId } = req.user;
  const data = await contactServices.deleteContact({ _id, userId });
  if (!data) {
    throw createError(404, 'Contact not found');
  }
  res.status(204).send();
};
