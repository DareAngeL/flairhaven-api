module.exports = {
    // Error handling middleware
    errorHandler: () => (err, req, res, next) => {
        console.error(`Failed to process request: ${err.message}`)
        res.status(500).send({ error: `Failed to process request: Error occured`})
    },
}