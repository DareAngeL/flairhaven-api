const mongoose = require('mongoose')

const Product = new mongoose.Schema({
    creatorId: {
        type: String,
        required: [true, 'User ID of the product\'s owner is required']
    },
    creatorProfilePicture: {
        type: String,
        required: [true, 'ownerProfilePicture is required']
    },
    creatorName: {
        type: String,
        required: [true, 'ownerName is required']
    },
    name: {
        type: String,
        required: [true, 'Name of the product is required']
    },
    imageData: {
        type: Object, // {resizedImage, originalImage}
        required: [true, 'Image Data is required']
    },
    description: {
        type: String,
        required: [true, 'description of the product is required']
    },
    price: {
        type: Number,
        required: [true, 'Price of the product is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdOn: {
        type: Date,
        default: new Date()
    },
    orders: [
        {
            orderId: {
                type: String,
                required: [true, 'Order ID is required']
            },
        }
    ],
    carts: [
        {
            cartId: {
                type: String,
                required: [true, 'Cart ID is required']
            }
        }
    ],
    comments: [
        {
            commentId: {
                type: String,
                required: [true, 'Comment ID is required']
            }
        }
    ],
    reactors: [
        {
            userId: {
                type: String,
                required: [true, 'UserID is required']
            },
            reaction: {
                type: Number,
                required: [true, 'Reaction is required']
            }
        }
    ],
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
})

Product.index({isActive: 1})
Product.index({name: 1})
Product.index({'carts.cartId': 1})

module.exports = mongoose.model('Product', Product)