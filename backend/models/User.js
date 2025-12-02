
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');



const AddressSchema = new mongoose.Schema({
    recipientName: { 
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    addressLine: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: [AddressSchema]
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password_hash')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
});


UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
};
module.exports = mongoose.model('User', UserSchema);