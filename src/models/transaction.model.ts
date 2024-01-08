// Yêu Cầu và Lịch Sử Giao Dịch (Transaction)
import mongoose, { Schema, Document } from 'mongoose';

interface Transaction extends Document {
    username: string;
    type: 'topup' | 'exchange';
    point: number;
}

const transactionSchema: Schema = new Schema({
    username: String,
    type: {
        type: String,
        enum: ['topup', 'exchange']
    },
    point: Number,
},
    { collection: 'Transaction' });

const TransactionModel = mongoose.model<Transaction>('Transaction', transactionSchema);

export default TransactionModel;
