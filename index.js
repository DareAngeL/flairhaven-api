const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./config')

const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

const app = express()
app.use(cors())
app.use(express.json({limit: '20mb'}))
app.use(express.urlencoded({limit: '20mb', extended: true}))

const port = process.env.PORT || config.port

// # region: set to strict query and connect to the database
mongoose.set('strictQuery', true)
mongoose.connect(config.database.uri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
// # end region

const db = mongoose.connection
// # region: database connection listeners
db.on(
    'error', 
    console.error.bind(console, 'Error occured while connecting to the database!')
)
db.once('open', () => {
    log('Connection to the database has been successful!')
})
// # end region

// # region: routes
app.use('/user', userRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
// # end region

app.listen(port, () => {
    log(`API is now online on port ${port}`)
})

// # region: utility
const log = (obj) => {
    console.log(obj)
}
// # end region