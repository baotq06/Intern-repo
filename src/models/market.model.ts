// market.model.ts
// Quản lý Vật Phẩm Trao Đổi (Market):
import mongoose, { Document } from 'mongoose';

interface Market extends Document {
    itemId: string;
    point: number;
    itemName: string;
}

const marketSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true
    },
    point: {
        type: Number,
        default: 0
    },
    itemName: {
        type: String,
        required: true,
    }
},
    { collection: 'Market' }
);

const MarketModel = mongoose.model<Market>('Market', marketSchema);

export default MarketModel;
