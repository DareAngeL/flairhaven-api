const express = require('express')
const auth = require('../auth')
const orderController = require('../controllers/orderController')

const router = express.Router()

const routes = {
    create: 'create',
    get: 'get',
    getOrdersDesigner: 'get_orders_designer'
}

/**
 * Retrieve authenticated user’s orders
 */
router.get(`/${routes.get}`, auth.verify, async (req, res, next) => {
    const {id, isAdmin} = auth.decode(req.headers.authorization)

    const data = {
        userId: id,
        isAdmin: isAdmin,
    }

    const result = await orderController.getOrders(data).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve all orders of the users - Admin Only
 */
router.get(`/admin/${routes.get}`, auth.verify, async (req, res, next) => {
    const {isAdmin} = auth.decode(req.headers.authorization)

    const result = await orderController.getAllOrders(isAdmin).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve all the orders that the designer want to get
 */
router.get(`/designer/${routes.getOrdersDesigner}`, auth.verify, async (req, res, next) => {
    const result = await orderController.getAllOrdersDesigner(req.body).catch(next)
    res.status(200).send(result)
})

/**
 * Place an order
 */
router.post(`/${routes.create}`, auth.verify, async (req, res, next) => {
    const {id, isAdmin} = auth.decode(req.headers.authorization)
    
    const data = {
        userId: id,
        isAdmin: isAdmin,
        products: req.body.products
    }

    const result = await orderController.placeOrder(data).catch(next)
    res.status(200).send(result)
})

module.exports = router