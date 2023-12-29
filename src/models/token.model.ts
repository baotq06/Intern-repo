import mongoose, { Document } from 'mongoose';

interface Token extends Document {
    userId: string;
    token: string;
}

const tokenSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    },
    { collection: 'tokens' }
);

const TokenModel = mongoose.model<Token>('Token', tokenSchema);

export default TokenModel;
