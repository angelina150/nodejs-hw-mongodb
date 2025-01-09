import ContactCollection from '../db/models/Contact.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';
export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
}) => {
  const limit = perPage;
  const skip = (page - 1) * limit;
  const data = await ContactCollection.find()
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder });
  const totalItems = await ContactCollection.countDocuments();
  const paginationData = calcPaginationData({ totalItems, page, perPage });
  return {
    data,
    page,
    perPage,
    totalItems,
    ...paginationData,
  };
};
export const getContact = (filter) => ContactCollection.findOne(filter);
export const getContactById = (id) => ContactCollection.findById(id);

export const addContact = (payload) => ContactCollection.create(payload);

export const updateContact = async (filter, payload) => {
  const result = await ContactCollection.findOneAndUpdate(filter, payload, {
    new: true,
  });
  return result;
};

export const deleteContact = (filter) =>
  ContactCollection.findOneAndDelete(filter);
