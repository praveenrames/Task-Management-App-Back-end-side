import mongoose from "mongoose";

const {model, Schema} = mongoose;
const optionRequired = {
    type: String,
    required: true,
};
const UserSchema = new Schema({
    firstName: optionRequired,
    lastName: optionRequired,
    email: {
        ...optionRequired,
        unique: true,
    },
    password: optionRequired,
    userImage: {
        type: String,
        required: false,
    },
});

const User = mongoose.model('User', UserSchema);

export default User;