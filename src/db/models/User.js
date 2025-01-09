import { Schema, model } from 'mongoose';
import { emailRegexp } from '../../constants/users.js';
import { handleSaveError, setUpdateSettings } from './hooks.js';
const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      match: emailRegexp,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);
usersSchema.post('save', handleSaveError);
usersSchema.post('findOneAndUpdate', handleSaveError);
usersSchema.pre('findOneAndUpdate', setUpdateSettings);
export const UsersCollection = model('users', usersSchema);
