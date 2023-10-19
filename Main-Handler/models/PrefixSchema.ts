import mongoose, { Schema } from "mongoose";
const PrefixSchema = new Schema({
    GuildID: {type: String},
    Prefix: {type: String}
},{
    timestamps: true
})
const name = 'Prefix-logs'
export default mongoose.models[name] || mongoose.model(name, PrefixSchema)  
