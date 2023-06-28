const mongoose = require('mongoose')

module.exports = mongoose.model('User', new mongoose.Schema({
    profilePicture: {
        type: Object,
        default: ''
    },
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required']
    },
    suffix: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    address: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    mobileNo: {
        type: String,
        default: ''
    },
    followers: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isDesigner: {
        type: Boolean,
        default: false
    },
    memberDate: {
        type: Date,
        default: new Date()
    }
}))