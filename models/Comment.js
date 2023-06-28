const mongoose = require('mongoose')

const Comment = new mongoose.Schema({
    productId: {
        type: String,
        required: [true, 'productId is required']
    },
    userId: {
        type: String,
        required: [true, 'userId is required']
    },
    userProfile: {
        type: String,
        default: ''
    },
    userName: {
        type: String,
        required: [true, 'userName is required']
    },
    comment: {
        type: String,
        required: [true, 'Comment is required']
    },
    commentedOn: {
        type: Date,
        default: new Date()
    }
})

Comment.index({productId: 1})

module.exports = mongoose.model('Comment', Comment)