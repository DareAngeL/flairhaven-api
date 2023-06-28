const express = require('express')
const auth = require('../auth')
const productController = require('../controllers/productController')
const RoutesUtil = require('../util/RoutesUtil')

const router = express.Router()

const routes = {
    active: 'active',
    all: 'all',
    search: 'search',
    create: 'create',
    update: 'update',
    archive: 'archive',
    unarchive: 'unarchive',
    cart: 'cart',
    removeProductFromCart: 'cart_remove_prod',
    addComment: 'add_comment',
    addReactor: 'add_reactor',
    getComment: 'comments',
    updateComment: 'update_comment',
    removeComment: 'remove_comment',
    getCartProducts: 'cart_products',
    clearCart: 'clear_cart',
    sortedProduct: '/active/sort/:sortType/:productName/:set'
}

/**
 * Retrieve all active products
 */
router.post(`/${routes.active}`, async (req, res, next) => {
    
    const data = {
        retrievedProdsIds: req.body
    }

    const result = await productController.getActiveProducts(data).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve all active products of a designer
 */
router.get(`/${routes.active}/designer`, auth.verify, async (req, res, next) => {
    const designerId = auth.decode(req.headers.authorization).id

    const result = await productController.getDesignerActiveProducts(designerId).catch(next)
    res.status(200).send(result)
})

/**
 * Search products
 */
router.get(`/${routes.search}/name=:productName/:sortType/:filterType?`, async (req, res, next) => {

    const data = {
        productName: req.params.productName,
        sortType: req.params.sortType,
        filterType: req.params.filterType
    }

    const result = await productController.searchProduct(data).catch(next)
    res.status(200).send(result)
})

/**
 * Get the products of a cart
 */
router.get(`/${routes.getCartProducts}`, auth.verify, async (req, res, next) => {
    const userId = auth.decode(req.headers.authorization).id

    const result = await productController.getProductsInCart(userId).catch(next)
    res.status(200).send(result)
})

/**
 * Clear the cart
 */
router.post(`/${routes.clearCart}`, auth.verify, async (req, res, next) => {
    const userId = auth.decode(req.headers.authorization).id

    const data = {
        userId: userId,
        products: req.body
    }

    const result = await productController.clearCart(data).catch(next)
    res.status(200).send(result)
})

/**
 * remove the products from cart
 */
router.get(`/${routes.removeProductFromCart}/:productId`, auth.verify, async (req, res, next) => {

    const { id, isAdmin } = auth.decode(req.headers.authorization)

    data = {
        userId: id,
        isAdmin: isAdmin,
        productId: req.params.productId,
    }

    const result = await productController.removeProductFromCart(data).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve all products
 */
router.get(`/${routes.all}`, auth.verify, async (req, res, next) => {
    const result = await productController.getAllProducts().catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve all products of a designer
 */
router.get(`/${routes.all}/designer`, auth.verify, async (req, res, next) => {
    const designerId = auth.decode(req.headers.authorization).id
    
    const result = await productController.getDesignerAllProducts(designerId).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve a product
 */
router.get('/:productId', auth.verify, async (req, res, next) => {
    const result = await productController.getProduct(req.params.productId).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve a product of a designer
 */
router.get('/:productId/designer', auth.verify, async (req, res, next) => {
    const data = {
        designerId: auth.decode(req.headers.authorization).id,
        productId: req.params.productId
    }
    
    const result = await productController.getDesignerProduct(data).catch(next)
    res.status(200).send(result)
})

/**
 * Create a product - (Admin & Designer account only)
 */
router.post(`/${routes.create}`, auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)
    req.body.userId = id
    const data = {
        isAdmin: isAdmin,
        isDesigner: isDesigner,
        product: req.body
    }

    const result = await productController.createProduct(data).catch(next)
    res.status(200).send(result)
})

/**
 * Update a product's information - (Admin account only)
 */
router.put(`/${routes.update}/:productId`, auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)
    
    const data = {
        designerId: id,
        productId: req.params.productId,
        isAdmin: isAdmin,
        isDesigner: isDesigner,
        new: req.body
    }

    const result = await productController.updateProduct(data).catch(next)
    res.status(200).send(result)
})

/**
 * Archive a product - (Admin account only)
 */
router.patch(`/${routes.archive}/:productId`, auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)
    
    const data = {
        designerId: id,
        productId: req.params.productId,
        isAdmin: isAdmin,
        isDesigner: isDesigner
    }

    const result = await productController.archiveProduct(data).catch(next)
    res.status(200).send(result)
})

/**
 * Unarchive a product - (Admin account only)
 */
router.patch(`/${routes.unarchive}/:productId`, auth.verify, async (req, res, next) => {
    const {isAdmin, isDesigner} = auth.decode(req.headers.authorization)

    const data = {
        productId: req.params.productId,
        isAdmin: isAdmin,
        isDesigner: isDesigner
    }

    const result = await productController.unarchiveProduct(data).catch(next)
    res.status(200).send(result)
})

/**
 * Add To Cart
 */
router.post(`/${routes.cart}/:productId`, auth.verify, async (req, res, next) => {
    const {id, isAdmin} = auth.decode(req.headers.authorization)
    
    const data = {
        userId: id,
        isAdmin: isAdmin,
        productId: req.params.productId,
    }
    
    const result = await productController.addToCart(data).catch(next)
    res.status(200).send(result)
})

/**
 * Change product quantity in the cart
 */
router.put(`/${routes.cart}/:productId/change_quantity=:quantity`, auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)
    
    const data = {
        userId: id,
        isAdmin: isAdmin,
        isDesigner: isDesigner,
        productId: req.params.productId,
        quantity: req.params.quantity,
    }
    
    const result = await productController.changeProductCartQuantity(data).catch(next)
    res.status(200).send(result)
})

/**
 * Remove a product from the cart
 */
router.post(`/${routes.cart}/:productId/remove`, auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)

    const data = {
        userId: id,
        isAdmin: isAdmin,
        isDesigner: isDesigner,
        productId: req.params.productId
    }

    const result = await productController.removeProductFromCart(data).catch(next)
    res.status(200).send(result)
})

/**
 * Add a comment
 */
router.post(`/:productId/${routes.addComment}`, auth.verify, async (req, res, next) => {
    const {id, isAdmin} = auth.decode(req.headers.authorization)

    const data = {
        userId: id,
        isAdmin: isAdmin,
        productId: req.params.productId,
        comment: req.body.comment
    }

    const result = await productController.addComment(data).catch(next)
    res.status(200).send(result)
})

/**
 * Retrieve comments of a product
 */
router.get(`/:productId/${routes.getComment}`, async (req, res, next) => {

    const data = {
        productId: req.params.productId
    }

    const result = await productController.getComments(data).catch(next)
    res.status(200).send(result)
})

/**
 * Add reactors / product rating
 */
router.post(`/:productId/${routes.addReactor}/rating=:reaction/avgRating=:ratings`, auth.verify, async (req, res, next) => {
    const {id} = auth.decode(req.headers.authorization)

    const data = {
        userId: id,
        productId: req.params.productId,
        ratings: req.params.ratings,
        reaction: req.params.reaction
    }

    const result = await productController.addReactors(data).catch(next)
    res.status(200).send(result)
})

/**
 * Update a Comment
 */
router.post(`/:productId/${routes.updateComment}`,  auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)
    
    const data = {
        userId: id,
        isAdmin: isAdmin,
        isDesigner: isDesigner,
        productId: req.params.productId,
        commentId: req.body.commentId,
        comment: req.body.comment
    }

    console.log(data.commentId)

    const result = await productController.updateComment(data).catch(next)
    res.status(200).send(result)
})

/**
 * Remove a comment
 */
router.delete(`/:productId/${routes.removeComment}`,  auth.verify, async (req, res, next) => {
    const {id, isAdmin, isDesigner} = auth.decode(req.headers.authorization)

    const data = {
        userId: id,
        isAdmin: isAdmin,
        isDesigner: isDesigner,
        productId: req.params.productId,
        commentId: req.body.commentId,
    }

    const result = await productController.removeComment(data).catch(next)
    res.status(200).send(result)
})

// Error handling
router.use(RoutesUtil.errorHandler())

module.exports = router