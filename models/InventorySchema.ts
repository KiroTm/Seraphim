import mongoose, { Schema } from "mongoose";

const InventorySchema = new Schema({
  GuildID: {type: String, required: true},
  UserID: {type: String, required: true},
  Items: [
    {
      name: String,
      amount: Number,
    },
  ],
});

export default mongoose.models['Inventory'] || mongoose.model('Inventory', InventorySchema);