// inventory.model.ts
// Quản Lý Hành Trang Cá Nhân (Inventory)
import mongoose, { Schema, Document } from 'mongoose';

interface InventoryItem {
    userId: string;
    itemname: string;
}

interface Inventory extends Document {
    items: InventoryItem[];
}

const inventorySchema: Schema = new Schema({
    items: [{
        userId: String,
        itemname: String
    }],
},
    { collection: 'Inventory' }
);

const InventoryModel = mongoose.model<Inventory>('Inventory', inventorySchema);

export default InventoryModel;
