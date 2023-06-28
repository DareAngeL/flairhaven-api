const Product = require('../models/Product')
const Utility = require('../util/Utility')
const Cart = require('../models/Cart')
const ControllerUtil = require('../util/ControllerUtil')
const Comment = require('../models/Comment')
const User = require('../models/User')

const limit = 60 // product limitation to retrieve per set

const SortType = {
    highest: 'high',
    lowest: 'low',
    best: 'best_selling',
    latest: 'latest',
    oldest: 'oldest'
}

const getActiveProducts = async (data) => {

    const {
        retrievedProdsIds
    } = data

    try {

        const foundProducts = await Product.find({
            _id: { $nin: retrievedProdsIds },
            isActive: true
        })

        const LIMIT = Math.min(foundProducts.length, limit)

        if (foundProducts.length === 0) {
            return ControllerUtil.responseData(false, [])
        }

        const randProds = []
        const randIndexPointers = []
        for (let i=0; i<LIMIT; i++) {
            const randomIndex = getRandomNumber(randIndexPointers, foundProducts.length)
            
            randIndexPointers.push(randomIndex)
            randProds.push(foundProducts[randomIndex])
        }

        return ControllerUtil.responseData(true, randProds)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getRandomNumber = (randIndexPointers, max) => {
    const randomIndex = Math.floor(Math.random() * max)
    if (!randIndexPointers.includes(randomIndex)) {
        return randomIndex
    }

    return getRandomNumber(randIndexPointers, max)
}

const searchProduct = async (data) => {

    try {
        return await sortFilter(data)
    } catch (err) {
        return Promise.reject(err)
    }
}

const sortFilter = async (data) => {

    const {
        productName: searchedTxt,
        sortType,
        filterType
    } = data

    const filter = filterType !== 'null' ? filterType : ''

    let foundProducts = null
    switch (sortType) {
        case SortType.best:
            foundProducts = await Product.aggregate([
                {
                    $match: { name: { $regex: searchedTxt, $options: 'i' } }
                },
                {
                    $match: { 'imageData.resizedImage': { $regex: `^data:image/${filter}` } }
                },
                {
                    $group: {
                        _id: "$_id",
                        creatorId: {$first: "$creatorId"},
                        creatorProfilePicture: {$first: "$creatorProfilePicture"},
                        creatorName: {$first: "$creatorName"},
                        name: {$first: "$name"},
                        imageData: {$first: "$imageData"},
                        description: {$first: "$description"},
                        price: {$first: "$price"},
                        isActive: {$first: "$isActive"},
                        createdOn: {$first: "$createdOn"},
                        orders: {$first: "$orders"},
                        carts: {$first: "$carts"},
                        comments: {$first: "$comments"},
                        reactors: {$first: "$reactors"},
                        ratings: {$first: "$ratings"},
                        ordersCount: {$sum: {$size: "$orders"}}
                    }
                },
                {
                    $sort: {ordersCount: -1}
                }
            ])

            if (foundProducts.length === 0) {
                return ControllerUtil.responseData(false, [])
            }

            return ControllerUtil.responseData(true, foundProducts)
        case SortType.highest:
            foundProducts = await Product.find({
                name: { $regex: searchedTxt, $options: 'i' },
                'imageData.resizedImage': { $regex: `^data:image/${filter}` }
            }).sort({price: -1})

            if (foundProducts.length === 0) {
                return ControllerUtil.responseData(false, [])
            }

            return ControllerUtil.responseData(true, foundProducts)
        case SortType.lowest:
            foundProducts = await Product.find({
                name: { $regex: searchedTxt, $options: 'i' },
                'imageData.resizedImage': { $regex: `^data:image/${filter}` }
            })
                .sort({price: 1})
            
            if (foundProducts.length === 0) {
                return ControllerUtil.responseData(false, [])
            }

            return ControllerUtil.responseData(true, foundProducts)
        case SortType.latest:
            foundProducts = await Product.find({
                name: { $regex: searchedTxt, $options: 'i' },
                'imageData.resizedImage': { $regex: `^data:image/${filter}` }
            })
                .sort({createdOn: -1})

            if (foundProducts.length === 0) {
                return ControllerUtil.responseData(false, [])
            }

            return ControllerUtil.responseData(true, foundProducts)
        case SortType.oldest:
            foundProducts = await Product.find({
                name: { $regex: searchedTxt, $options: 'i' },
                'imageData.resizedImage': { $regex: `^data:image/${filter}` }
            })
                .sort({createdOn: 1})

            if (foundProducts.length === 0) {
                return ControllerUtil.responseData(false, [])
            }

            return ControllerUtil.responseData(true, foundProducts)
        default:
            const products = await Product.find({ 
                name: { $regex: searchedTxt, $options: 'i' },
                'imageData.resizedImage': { $regex: `^data:image/${filter}` }
            })
        
            return ControllerUtil.responseData(true, products)
    }
}

const getProductsInCart = async (userId) => {
    try {
        const foundCarts = await Cart.find({userId: userId})
        if (foundCarts.length === 0) {
            return ControllerUtil.responseData(true, [])
        }

        const cart = foundCarts[0]
        const foundProducts = await Promise.all(
            await Product.find({ carts: { $elemMatch: { cartId: cart._id } } }).lean()
        )

        if (foundProducts.length > 0) {
            return ControllerUtil.responseData(true, foundProducts)
        }

        return ControllerUtil.responseData(true, [])
    } catch (err) {
        return Promise.reject(err)
    }
}

const getProduct = async (productId) => {
    try {
        const foundProduct = await Product.findById(productId)
        if (!foundProduct) {
            return ControllerUtil.responseData('Product does not exist!')
        }

        return ControllerUtil.responseData(true, foundProduct)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getDesignerProduct = async (data) => {
    try {
        const {designerId, productId} = data
        console.log(productId)
        const foundProduct = await Product.findById(productId)
        if (!foundProduct || !foundProduct.isActive) {
            return ControllerUtil.responseData('Product does not exist!')
        }

        if (foundProduct.userId !== designerId) {
            return ControllerUtil.responseData('This is not your product!')
        }

        return ControllerUtil.responseData(true, foundProduct)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getDesignerActiveProducts = async (designerId) => {
    try {
        const foundProducts = await Product.find({creatorId: designerId, isActive: true})
        const hasProducts = foundProducts.length===0?false:true

        return ControllerUtil.responseData(hasProducts, foundProducts)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getDesignerAllProducts = async (designerId) => {
    try {
        const foundProducts = await Product.find({creatorId: designerId})
        const hasProducts = foundProducts.length===0?false:true

        return ControllerUtil.responseData(hasProducts, foundProducts)
    } catch (err) {
        
    }
}

const getAllProducts = async () =>{
    try {
        const foundProducts = await Product.find({})
        const hasProducts = foundProducts.length===0?false:true
        
        return ControllerUtil.responseData(hasProducts, foundProducts)
    } catch (err) {
        return Promise.reject(err)
    }
}

const createProduct = async (data) => {
    try {
        // check if user is an admin or designer.
        // only admin and designer can create a product.
        if (!data.isAdmin && !data.isDesigner) {
            const unauth = Utility.unauthAccessStr('create')
            return ControllerUtil.responseData(unauth)
        }

        const {product: newProduct} = data

        const foundUser = await User.findById(newProduct.userId)
        if (!foundUser) {
            return ControllerUtil.responseData(false, 'You are not allowed to add product!')
        }

        const product = new Product({
            creatorId: foundUser._id,
            creatorProfilePicture: foundUser.profilePicture,
            creatorName: `${foundUser.firstName} ${foundUser.lastName} ${foundUser.suffix}`.trim(),
            name: newProduct.name,
            imageData: newProduct.imageData,
            description: newProduct.description,
            price: newProduct.price,
            createdOn: new Date()
        })

        const createdProduct = await product.save()
        return ControllerUtil.responseData(true, createdProduct)
    } catch (err) {
        return Promise.reject(err)
    }
}

const updateProduct = async (data) => {
    // check if user is an admin or designer.
    // only admin and designer can update a product.
    if (!data.isAdmin && !data.isDesigner) {
        const unauth = Utility.unauthAccessStr('update')
        return ControllerUtil.responseData(unauth)
    }

    const { productId, designerId, new: newData } = data

    try {
        const foundProduct = await Product.findById(productId)
        // verify first if the product exists or if the user
        // is a designer, make sure it is his/her product.
        const {isContinue, message} = await checkFoundProduct(data, designerId, foundProduct)
        if (!isContinue) {
            return message
        }

        foundProduct.name = newData.name ?? foundProduct.name
        foundProduct.imageData = newData.imageData ?? foundProduct.imageData
        foundProduct.description = newData.description ?? foundProduct.description
        foundProduct.price = newData.price ?? foundProduct.price

        const savedProduct = await foundProduct.save()
        return ControllerUtil.responseData(true, savedProduct)
    } catch (err) {
        return Promise.reject(err)
    }
}

const archiveProduct = async (data) => {
    // check if user is an admin or designer.
    // only admin and designer can archive a product.
    if (!data.isAdmin && !data.isDesigner) {
        const unauth = Utility.unauthAccessStr('archive')
        return ControllerUtil.responseData(unauth)
    }

    const {designerId, productId} = data

    try {
        const foundProduct = await Product.findById(productId)
        // verify first if the product exists or if the user
        // is a designer, make sure it is his/her product.
        const {isContinue, message} = await checkFoundProduct(data, designerId, foundProduct)
        if (!isContinue) {
            return message
        }

        foundProduct.isActive = false
        await foundProduct.save()

        return ControllerUtil.responseData(true)
    } catch (err) {
        return Promise.reject(err)
    }
}

const unarchiveProduct = async (data) => {
    // check if user is an admin.
    // only admin can unarchive a product.
    if (!data.isAdmin && !data.isDesigner) {
        const unauth = Utility.unauthAccessStr('unarchive')
        return ControllerUtil.responseData(unauth)
    }

    const {productId} = data

    try {
        await Product.findByIdAndUpdate(
            productId, {isActive: true}
        )
        return ControllerUtil.responseData(true)
    } catch (err) {
        return Promise.reject(err)
    }
}

const addToCart = async (data) => {
    const {
        userId: _userId,
        isAdmin,
        productId, 
    } = data

    if (isAdmin) {
        return ControllerUtil.responseData('Only regular user and designer can add to cart')
    }

    try {
        const foundProduct = await Product.findById(productId)
        if (!foundProduct) {
            return ControllerUtil.responseData('Product does not exists!')
        }

        let cart = await Cart.findOne({userId: _userId})
        if (!cart) {
            const newCart = new Cart({
                userId: _userId,
                totalPrice: 0,
                products: []
            })

            const updatedCart = await toCart(newCart, foundProduct)
            return ControllerUtil.responseData(true, updatedCart)
        }

        const updatedCart = await toCart(cart, foundProduct)
        return ControllerUtil.responseData(true, updatedCart)
    } catch (err) {
        return Promise.reject(err)
    }
}

const removeProductFromCart = async (data) => {
    const {
        userId: _userId,
        isAdmin,
        productId,
    } = data

    if (isAdmin) {
        return ControllerUtil.responseData('Only regular user can remove product from cart')
    }

    try {
        const foundProduct = await Product.findById(productId)
        if (!foundProduct) {
            return ControllerUtil.responseData('Product does not exists!')
        }

        const foundCart = await Cart.findOne({userId: _userId})
        if (!foundCart) {
            return ControllerUtil.responseData('Cart does not exists!')
        }

        await Product.updateOne(
            {_id: productId},
            {$pull: {carts: {cartId: foundCart.id}}}
        )

        const updatedCart = await Cart.updateOne(
            {_id: foundCart.id},
            {$pull: {products: {productId: foundProduct.id}}}
        )

        if (updatedCart.modifiedCount === 1) {
            return ControllerUtil.responseData(true)
        }

        return ControllerUtil.responseData('Unable to removed product. Product not found in the cart')
    } catch (err) {
        return Promise.reject(err)
    }
}

const toCart = async (newCart, foundProduct) => {
    const _subTotal = foundProduct.price
    newCart.totalPrice += _subTotal

    let isProductExists = false
    newCart.products.map(product => {
        if (foundProduct.id === product.productId) {
            isProductExists = true
            product.subTotal += _subTotal
        }

        return product
    })

    if (!isProductExists) {
        newCart.products.push({
            productId: foundProduct.id,
            subTotal: _subTotal,
        })

        foundProduct.carts.push({
            cartId: newCart._id,
        })
    }

    await foundProduct.save()
    const updatedCart = await newCart.save()

    return updatedCart
}

const clearCart = async (data) => {
    const {
        userId,
        products
    } = data
    try {
        const foundCart = await Cart.findOne({userId: userId})
        if (!foundCart) {
            return ControllerUtil.responseData('Cart does not exists!')
        }

        foundCart.products = []
        foundCart.totalPrice = 0

        products.forEach(async prod => {
            const foundProduct = await Product.findById(prod._id)
            if (!foundProduct) {
                return ControllerUtil.responseData('Product does not exists!')
            }

            foundProduct.carts = []

            await foundProduct.save()
        })

        await foundCart.save()
        return ControllerUtil.responseData(true)
    } catch (err) {
        return Promise.reject(err)
    }
}

const checkFoundProduct = async (data, designerId, foundProduct) => {
    // check if the product exists
    if (!foundProduct) {
        return {
            isContinue: false,
            message: ControllerUtil.responseData('Product does not exists!')
        }
    }
    // if the user is a designer then check if it's his/her product.
    // only the products that're owned by the designer can he/she be able to update
    if (data.isDesigner && foundProduct.creatorId !== designerId) {
        return {
            isContinue: false,
            message: ControllerUtil.responseData('This is not your product!')
        }
    }

    return {
        isContinue: true,
        message: undefined
    }
}

const addComment = async (data) => {
    const {
        userId: _userId,
        productId: _productId, 
        isAdmin,
        comment: _comment
    } = data

    if (isAdmin) {
        return ControllerUtil.responseData('Only regular user and designer can add a comment')
    }

    try {
        const foundUser = await User.findById(_userId)
        if (!foundUser) {
            return ControllerUtil.responseData('User does not exists!')
        }
        const foundProduct = await Product.findById(_productId)
        if (!foundProduct) {
            return ControllerUtil.responseData('Product does not exists!')
        }

        const comment = new Comment({
            productId: _productId,
            userId: foundUser._id,
            userProfile: foundUser.profilePicture,
            userName: `${foundUser.firstName} ${foundUser.lastName} ${foundUser.suffix}`.trim(),
            comment: _comment,
            commentedOn: new Date()
        })
        const savedComment = await comment.save()

        foundProduct.comments.push({
            commentId: savedComment._id,
        })

        await foundProduct.save()
        const res = await getComments({productId: _productId})

        return ControllerUtil.responseData(true, {
            product: foundProduct,
            comments: res.body
        })
    } catch (err) {
        return Promise.reject(err)
    }
}

const getComments = async (data) => {
    const {
        productId: _productId,
    } = data

    try {
        const foundComments = await Comment.find({productId: _productId})
        const hasComments = foundComments.length===0?false:true

        return ControllerUtil.responseData(hasComments, foundComments)
    } catch (err) {
        return Promise.reject(err)
    }
}

const addReactors = async (data) => {
    const {
        userId: _userId,
        productId: _productId,
        ratings,
        reaction
    } = data

    try {
        const foundUser = await User.findById(_userId)
        if (!foundUser) {
            return ControllerUtil.responseData('User does not exists!')
        }
        const foundProduct = await Product.findById(_productId)
        if (!foundProduct) {
            return ControllerUtil.responseData('Product does not exists!')
        }

        // try to the update first to see if the reactor already exists
        const result = await Product.updateOne(
            { _id: _productId, "reactors.userId": _userId },
            { $set: { "reactors.$.reaction": reaction } }
        )
        // Check if the update was not successful
        // if it was not successful, then it means- this is a new reactor
        if (result.modifiedCount !== 1) {   
            foundProduct.reactors.push({
                userId: _userId,
                reaction: reaction
            })
        } else {
            foundProduct.reactors.map(reactor => {
                if (reactor.userId === _userId) {
                    reactor.reaction = reaction
                }

                return reactor
            })
        }

        foundProduct.ratings = ratings

        const updatedProduct = await foundProduct.save()
        return ControllerUtil.responseData(true, updatedProduct)
    } catch (err) {
        return Promise.reject(err)
    }
}

const updateComment = async (data) => {
    const {
        userId: _userId,
        productId: _productId, 
        isAdmin, 
        isDesigner,
        commentId,
        comment: _comment
    } = data

    if (isAdmin) {
        return ControllerUtil.responseData('Only regular user and designer can add a comment')
    }

    try {
        const foundComment = await Comment.findById(commentId)
        if (!foundComment) {
            return ControllerUtil.responseData('Comment not found')
        }
        if (foundComment.userId !== _userId) {
            return ControllerUtil.responseData('This is not your comment!')
        }
        if (foundComment.productId !== _productId) {
            return ControllerUtil.responseData('No comment found on the product you provided!')
        }

        foundComment.comment = _comment
        const savedComment = await foundComment.save()

        return ControllerUtil.responseData(true, savedComment)
    } catch (err) {
        return Promise.reject(err)
    }
}

const removeComment = async (data) => {
    const {
        userId: _userId,
        productId: _productId,
        isAdmin,
        isDesigner,
        commentId,
    } = data

    try {
        const foundComment = await Comment.findById(commentId)
        if (!foundComment) {
            return ControllerUtil.responseData('Comment not found')
        }
        if (foundComment.userId !== _userId && !isAdmin) {
            return ControllerUtil.responseData('This is not your comment!')
        }
        if (foundComment.productId !== _productId) {
            return ControllerUtil.responseData('No comment found on the product you provided!')
        }

        const result = await Product.updateOne(
            { _id: _productId },
            { $pull: { comments: { commentId: commentId } } }
        );
        if (!result) {
            return ControllerUtil.responseData('Unable to delete. Something went wrong.')
        }
 
        const deleteResult = await Comment.deleteOne({_id: commentId})
        if (deleteResult.deletedCount > 0) {
            return ControllerUtil.responseData(true)
        }

        return ControllerUtil.responseData('No comment deleted.')
    } catch (err) {
        return Promise.reject(err)
    }
}

module.exports = {
    searchProduct,
    clearCart,
    getProductsInCart,
    getActiveProducts, 
    getProduct, 
    getAllProducts,
    createProduct,
    updateProduct,
    archiveProduct,
    unarchiveProduct,
    getDesignerAllProducts,
    getDesignerActiveProducts,
    getDesignerProduct,
    addToCart,
    removeProductFromCart,
    addComment,
    updateComment,
    removeComment,
    addReactors,
    getComments
}