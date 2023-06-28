const mongoose = require('mongoose')

const Order = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total Amount is required']
    },
    purchasedOn: {
        type: Date,
        default: new Date()
    },
    products: [
        {
            productId: {
                type: String,
                required: [true, 'Product ID is required']
            },
            subTotal: {
                type: Number,
                required: [true, 'Subtotal is required']
            }
        }
    ]
})

Order.index({userId: 1})

module.exports = mongoose.model('Order', Order)