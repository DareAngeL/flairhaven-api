const { default: mongoose } = require("mongoose")
const Order = require("../models/Order")
const Product = require("../models/Product")
const ControllerUtil = require("../util/ControllerUtil")
const Utility = require("../util/Utility")

const getOrders = async (data) => {
    const {userId, isAdmin} = data
    
    if (isAdmin) {
        return ControllerUtil.responseData('Only regular user can retrieve its orders')
    }

    try {
        const foundOrders = await Order.find({userId: userId})
        const hasOrders = foundOrders.length===0?false:true

        let allProducts = []
        if (hasOrders) {
            for (let i=0; i<foundOrders.length; i++) {
                const order = foundOrders[i]
                const foundProducts = await Product.find({ orders: { $elemMatch: { orderId: order._id } } });
                allProducts = [...allProducts, ...foundProducts]
            }
        }

        return ControllerUtil.responseData(hasOrders, allProducts)
    } catch (err) {
        return Promise.reject(err)
    }
}

/**
 * Get all the orders that the designer want to get
 * @param {*} data 
 */
const getAllOrdersDesigner = async (data) => {
    const {orders} = data

    let foundOrders = []
    try {
        await orders.forEach(async order => {
            const foundOrder = await Order.findById(order.orderId)
            if (foundOrder) {
                foundOrders = [...foundOrders, ...foundOrder]
            }
        });

        return ControllerUtil.responseData(true, foundOrders)

    } catch (err) {
        return Promise.reject(err)
    }
}

const getAllOrders = async (isAdmin) => {
    if (!isAdmin) {
        return ControllerUtil.responseData('Unauthorized to retrieve all orders')
    }

    try {
        const foundOrders = await Order.find({})
        const hasOrders = await foundOrders.length===0?false:true

        return ControllerUtil.responseData(hasOrders, foundOrders)
    } catch (err) {
        return Promise.reject(err)
    }
}

const placeOrder = async (data) => {
    try {
        const { userId, isAdmin, products } = data

        if (isAdmin) {
            return ControllerUtil.responseData('Only regular user and designer can place order')
        }

        // check all products if it exists and available.
        const objIDs = products.map(product => new mongoose.Types.ObjectId(product.productId))
        const foundProducts = await Product.find({ _id: { $in: objIDs }, isActive: true })
        // if the foundProducts length is not equal to the length of 
        // the provided products then it means one of the products does
        // not exists or not available -- Do not continue placing order
        if (foundProducts.length !== products.length) {
            return ControllerUtil.responseData('Unable to place order. One of the products does not exists or not available')
        }

        const newOrder = new Order({
            userId: userId,
            totalAmount: 0,
            products: []
        })

        const placedProducts = []
        for (let i=0; i<products.length; i++) {
            const {productId: _productId} = products[i]

            const foundProduct = await Product.findById(_productId)
            foundProduct.orders.push({
                orderId: newOrder._id
            })

            newOrder.totalAmount += foundProduct.price

            newOrder.products.push({
                productId: _productId,
                subTotal: foundProduct.price
            })

            await foundProduct.save()
            placedProducts.push(foundProduct)
        }

        await newOrder.save()
        return ControllerUtil.responseData(true, placedProducts)
    } catch (err) {
        return Promise.reject(err)
    }
}

module.exports = {
    getAllOrdersDesigner,
    placeOrder,
    getOrders,
    getAllOrders
}