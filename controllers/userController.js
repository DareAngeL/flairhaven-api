const User = require('../models/User')
const bcrypt = require('bcrypt')
const auth = require('../auth')
const Utility = require('../util/Utility')
const ControllerUtil = require('../util/ControllerUtil')
const Order = require('../models/Order')
const Follower = require('../models/Follower')
const Cart = require('../models/Cart')

const userDetails = async (userId) => {
    try {
        const details = await User.findById(userId)
        if (!details) {
            return ControllerUtil.responseData('User not found')
        }

        details.password = 'encrypted'
        return ControllerUtil.responseData(true, details)
    } catch (err) {
        return Promise.reject(err)
    }
}

const updateUserDetails = async (data) => {

    const {
        userId: _userId,
        newInfo
    } = data

    try {
        const foundUser = await User.findById(_userId)
        if (!foundUser) {
            return ControllerUtil.responseData('User not found!')
        }

        foundUser.profilePicture = newInfo.profilePicture
        foundUser.firstName = newInfo.firstName
        foundUser.lastName = newInfo.lastName
        foundUser.suffix = newInfo.suffix
        foundUser.address = newInfo.address
        foundUser.mobileNo = newInfo.mobileNo

        const updatedInfo = await foundUser.save()
        updatedInfo.password = 'encrypted'
        return ControllerUtil.responseData(true, {
            access: auth.generateAccessToken(updatedInfo),
            updatedInfo: updatedInfo
        })
    } catch (err) {
        return Promise.reject(err)
    }
}

const register = async (data) => {
    try {
        const isEmailExists = await checkEmailExist(data)
        if (isEmailExists.message) {
            return isEmailExists
        }

        const user = new User({
            firstName: data.firstName,
            lastName: data.lastName,
            suffix: data.suffix,
            email: data.email,
            address: data.address,
            mobileNo: data.mobileNo,
            password: bcrypt.hashSync(data.password, 12),
            isAdmin: data.isAdmin ?? false,
            isDesigner: data.isDesigner ?? false
        })

        const newUser = await user.save()
        newUser.password = 'encrypted'
        return ControllerUtil.responseData(true, newUser)
    } catch (err) {
        return Promise.reject(err)
    }
}

const login = async (data) => {
    try {
        const foundUser = await User.findOne({email: data.email})
        if (foundUser === null) {
            return ControllerUtil.responseData('User does not exist!')
        }

        const isPwdCorrect = bcrypt.compareSync(data.password, foundUser.password)
        if (isPwdCorrect) {
            return {access: auth.generateAccessToken(foundUser)}
        }
        // if password is not correct
        return ControllerUtil.responseData('Password is incorrect!')
    } catch (err) {
        return Promise.reject(err)
    }
}

const checkEmailExist = async (data) => {
    try {
        const foundUser = await User.findOne({email: data.email})
        if (!foundUser) {
            return ControllerUtil.responseData(false, 'Email is not yet registered!')
        }

        return ControllerUtil.responseData(true, 'Email is already registered!')
    } catch (err) {
        return Promise.reject(err)
    }
}

const orders = async (userId) => {
    try {
        const foundOrders = await Order.find({userId: userId})
        if (foundOrders.length === 0) {
            return ControllerUtil.responseData('You don\'t have orders yet.')
        }

        return ControllerUtil.responseData(true, foundOrders)
    } catch (err) {
        return Promise.reject(err)
    }
}

const allOrders = async (data) => {
    if (!data.isAdmin) {
        const nonAuthStr = Utility.unauthAccessStr('update to admin')
        return ControllerUtil.responseData(nonAuthStr)
    }

    try {
        const foundOrders = await Order.find({})
        if (foundOrders.length === 0) {
            return ControllerUtil.responseData('No placed orders yet.')
        }

        return ControllerUtil.responseData(true, foundOrders)
    } catch (err) {
        return Promise.reject(err)
    }
}

const setAdmin = async (data) => {
    if (!data.isAdmin) {
        return ControllerUtil.responseData('Not authorized to update to admin')
    }

    const {userId: id} = data

    try {
        const updatedUserData = await User.findByIdAndUpdate(id, {isAdmin: true}, {new: true})
        if (!updatedUserData) {
            return ControllerUtil.responseData('Unable to set as admin. User ID not found')
        }

        return ControllerUtil.responseData(true, updatedUserData)
    } catch (err) {
        return Promise.reject(err)
    }
}

const setDesigner = async (userId) => {
    try {
        const updatedUserData = await User.findByIdAndUpdate(userId, {isDesigner: true}, {new: true})
        if (!updatedUserData) {
            return ControllerUtil.responseData('Unable to set as designer. User ID not found')
        }

        return ControllerUtil.responseData(true, {
            user: updatedUserData,
            access: auth.generateAccessToken(updatedUserData)
        })
    } catch (err) {
        return Promise.reject(err)
    }
}

const addFollower = async (data) => {

    const {
        userId: _userId,
        following: _following // user id
    } = data

    try {
        const foundUser = User.findById(_userId)
        if (!foundUser) {
            ControllerUtil.responseData('User not found!')
        }

        const newFollower = new Follower({
            userId: _userId,
            following: _following
        })

        const addedFollower = await newFollower.save()
        foundUser.followers++
        await foundUser.save()

        return ControllerUtil.responseData(true, addedFollower)
    } catch (err) {
        return Promise.reject(err)
    }
}

const getFollowers = async (data) => {
    const {
        userId: _userId
    } = data

    try {
        const foundUser = User.findById(_userId)
        if (!foundUser) {
            ControllerUtil.responseData('User not found!')
        }

        const foundFollowers = await Follower.find({userId: _userId})
        if (foundFollowers.length === 0) {
            return ControllerUtil.responseData(true, [])
        }

        return ControllerUtil.responseData(true, foundFollowers)
    } catch (err) {
        return Promise.reject(err)
    }
}

module.exports = {
    updateUserDetails,
    getFollowers,
    register,
    login,
    checkEmailExist,
    setAdmin,
    userDetails,
    setDesigner,
    orders,
    allOrders,
    addFollower
}