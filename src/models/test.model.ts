import mongoose, { Document } from 'mongoose';

interface User extends Document {
  name: string;
  age: number;
  address: string;
  team: string;
  role: string;
  username: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    team: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    }
  },
  { collection: 'admin' }
);

const UserModel = mongoose.model<User>('admin', userSchema);

export default UserModel;
