const jwt = require('jsonwebtoken')
const User = require('../models/user')

//Headers are key value pairs providing more information to the server
//Headers can be sent by the client but also sent back by the server in response

// Express Middleware function
const auth = async (req, res, next) => {
    try{
        // Get value for header
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})

        if(!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'})
    }
}

module.exports = auth