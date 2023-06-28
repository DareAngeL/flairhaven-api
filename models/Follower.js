const mongoose = require("mongoose");

module.exports = mongoose.model('Follower', new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    following: {
        type: String,
        required: [true, 'Following is required']
    }
}))