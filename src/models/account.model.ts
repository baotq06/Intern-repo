// account.model.ts
// Quản Lý Tài Khoản Cá Nhân (Account):
import mongoose, { Schema, Document } from 'mongoose';

interface Account extends Document {
    username: string;
    point: number;
}

const accountSchema: Schema = new Schema({
    username: {
        type: String,
        unique: true
    },
    point: {
        type: Number,
        default: 0
    }
},
    { collection: 'Account' }
);

const AccountModel = mongoose.model<Account>('Account', accountSchema);

export default AccountModel;
