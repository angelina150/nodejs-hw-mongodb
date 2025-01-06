import Joi from 'joi';
import { typeList } from '../constants/contacts.js';
export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Name should have at least {#limit} characters',
    'string.max': 'Name should have at most {#limit} characters',
    'any.required': 'Name is required',
  }),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean().required(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .required()
    .valid(...typeList),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.min': 'Name should have at least {#limit} characters',
    'string.max': 'Name should have at most {#limit} characters',
  }),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .valid(...typeList),
});
