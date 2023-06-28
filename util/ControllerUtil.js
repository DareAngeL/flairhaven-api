module.exports = {
    responseData: (msg, data = undefined) => ({
        message: msg,
        body: data
    })
}