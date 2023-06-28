const express = require("express")
const auth = require("../auth")
const userController = require('../controllers/userController')
const RoutesUtil = require("../util/RoutesUtil")

const router = express.Router()
const routes = {
    auth: 'authenticate',
    register: 'register',
    login: 'login',
    chckEmail: 'checkEmailExists',
    admin: 'updateAdmin',
    designer: 'updateDesigner',
    details: 'details',
    updateDetails: 'updateDetails',
    orders: 'orders',
    allOrders: 'allOrders',
    getFollowers: 'getFollowers',
    addFollower: 'addFollower',
}

router.get(`/${routes.auth}`, auth.verify, async (req, res, next) => {
    res.status(200).send(JSON.stringify({auth: 'success'}))
})

/**
 * Get user detail from the token
 */
router.get(`/${routes.details}`, auth.verify, async (req, res, next) => {
    const userId = auth.decode(req.headers.authorization).id
    const result = await userController.userDetails(userId).catch(next)
    res.status(200).send(result)
})

/**
 * Get user detail from params
 */
router.get(`/${routes.details}/:userId`, async (req, res, next) => {
    const userId = req.params.userId
    const result = await userController.userDetails(userId).catch(next)
    res.status(200).send(result)
})

/**
 * Updates user details
 */
router.put(`/${routes.updateDetails}`, auth.verify, async (req, res, next) => {
    const userId = auth.decode(req.headers.authorization).id

    const data = {
        userId: userId,
        newInfo: req.body
    }

    const result = await userController.updateUserDetails(data).catch(next)
    res.status(200).send(result)
})

/**
 * Get User Orders
 */
router.get(`/${routes.orders}`, auth.verify, async (req, res, next) => {
    const userId = auth.decode(req.headers.authorization).id
    const result = await userController.orders(userId).catch(next)
    res.status(200).send(result)
})

router.get(`/${routes.allOrders}/:userId`, auth.verify, async (req, res, next) => {
    const data = {
        isAdmin: auth.decode(req.headers.authorization).isAdmin,
        userId: req.params.userId
    }

    const result = await userController.allOrders(data).catch(next)
    res.status(200).send(result)
})

router.post(`/${routes.register}`, async (req, res, next) => {
   const result = await userController.register(req.body).catch(next)
   res.status(200).send(result)
})

router.post(`/${routes.login}`, async (req, res, next) => {
    const result = await userController.login(req.body).catch(next)
    res.status(200).send(result)
})

router.post(`/${routes.chckEmail}`, async (req, res, next) => {
    const result = await userController.checkEmailExist(req.body).catch(next)
    res.status(200).send(result)
})

router.get(`/${routes.getFollowers}`, auth.verify, async (req, res, next) => {
    const data = {
        userId: auth.decode(req.headers.authorization).id
    }

    const result = await userController.getFollowers(data).catch(next)
    res.status(200).send(result)
})

router.post(`/${routes.addFollower}/:designerUserId`, auth.verify, async (req, res, next) => {

    const data = {
        userId: req.params.designerUserId,
        following: auth.decode(req.headers.authorization).id,
    }

    const result = await userController.addFollower(data).catch(next)
    res.status(200).send(result)
})

router.patch(`/${routes.admin}/:userId`, auth.verify, async (req, res, next) => {
    const data = {
        isAdmin: auth.decode(req.headers.authorization).isAdmin,
        userId: req.params.userId
    }

    const result = await userController.setAdmin(data).catch(next)
    res.status(200).send(result)
})

router.patch(`/${routes.designer}`, auth.verify, async (req, res, next) => {
    const userId = auth.decode(req.headers.authorization).id
    const result = await userController.setDesigner(userId).catch(next)
    res.status(200).send(result)
})

router.use(RoutesUtil.errorHandler())
module.exports = router