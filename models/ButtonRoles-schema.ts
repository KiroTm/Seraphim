import mongoose, { Schema } from "mongoose";
const NotreqString = {
    type: String,
    required: false
}
const NotreqArray = {
    type: Array,
    required: false 
}
const ButtonRoleSchema = new Schema({
    GuildId: NotreqString,
    UserId: NotreqString,
    Role: NotreqString,
    Roles: NotreqArray,
    Name: NotreqString,
    Description: NotreqString
})
const name = "ButtonRoles-Infos"
export default mongoose.models[name] || mongoose.model(name, ButtonRoleSchema)  
