import mongoose, { Schema, Document } from 'mongoose';

interface Token extends Document {
    userId: string;
    token: string;
}

const tokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
});

const TokenModel = mongoose.model<Token>('Token', tokenSchema);

export default TokenModel;
