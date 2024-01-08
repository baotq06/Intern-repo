import mongoose, { Document, Schema } from 'mongoose';

interface InventoryItem {
  itemId: mongoose.Types.ObjectId;
  itemName: string;
  points: number;
  timestamp: Date;
}

const inventoryItemSchema = new Schema<InventoryItem>(
  {
    itemName: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
);

interface User extends Document {
  name: string;
  age: number;
  address: string;
  team: string;
  role: string;
  username: string;
  password: string;
  point: number;
  type: 'topup' | 'exchange';
  inventory: InventoryItem[];
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
    },
    point: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['topup', 'exchange']
    },
    inventory: {
      type: [inventoryItemSchema],
      default: [],
    },
  },
  { collection: 'admin' }
);

const UserModel = mongoose.model<User>('admin', userSchema);

export default UserModel;
