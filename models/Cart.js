const mongoose = require('mongoose')

const Cart = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total Price is required']
    },
    products: [
        {
            productId: {
                type: String,
                required: [true, 'Product ID is required']
            },
            subTotal: {
                type: Number,
                required: [true, 'Sub-total is required']
            },
        }
    ]
})

Cart.index({userId: 1})

module.exports = mongoose.model('Cart', Cart)