const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()

//Middleware (mongoose documentation)
// way customize behavior of mongoose model

// CREATE a resource
router.post('/users', async (request, response) => {
    //This is how we grab incoming body data
        //console.log(request.body)
        //response.send("Testing!")
    const user = new User(request.body)
    // user.save().then(() => {
    //     response.status(201).send(user)
    // }).catch((e) => {
    //     response.status(400).send(e)
    // })

    //USING AWAIT NOW
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        response.status(201).send({user, token})
    } catch(e) {
        response.status(400).send(e)
    }''

})

//Http request to login with user credentials + validation check
//login request should send back an authentication token that can be used later for other non-public requests
//JWT => JSON Web Token ... tokens can expire or not + other features
// npm module => jsonwebtoken
router.post('/users/login', async (req, res) => {
    try {
        // Creating our own functions for user model
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})

//Need to be logged in, in order to be able to log out, so do auth check
router.post('/users/logout', auth, async (req, res)=> {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token //is they are equal, then it will return false, and remove it from the array
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res)=> {
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// ONLY 2 ROUTES THAT WILL STAY PUBLIC ARE LOGIN AND SIGNUP, REST WILL REQUIRE USER TO BE LOGGED IN

//To get all the users
//To add middleware, we pass it in arguement before the route handler
router.get('/users/me', auth, async (req, res) => {
    // look up mongoose queries to get mongoose CRUD operations
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
    //USING AWAIT
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }catch(e) {
    //     res.status(500).send()
    // }

    res.send(req.user)

})

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please upload an image file (jpg, jpeg, or png)'))
        }
        cb(undefined, true)
    }
    
})

// POST for avatar uploads
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //if theres not dest property on multer, u can access the file on req.file
    //req.user.avatar = req.file.buffer

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }
        //if things go well
        // need to tell requester what type of data they getting back (like jpg or png)
        // can be done by setting a response header
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    }catch (e) {
        res.status(404).send()
    }
})

//To get individual/specific user
// using route parameters
// router.get('/users/:id', async (req, res) => {
//     //console.log(req.params)
//     const _id = req.params.id
//     //look up mongoose queries
//     // User.findById(_id).then((user) => {
//     //     //might not always have user with id
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
        
//     // }).catch((e) => {
//     //     res.status(500).send()
//     // })
//     //ASYNC AWAIT
//     try {
//         const user = await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send()
//     }

// })

//update existing resource
router.patch('/users/me', auth, async (req, res) => {
    //Code to prevent ppl from updating things that dont exist or they
    // are not allowed to update (like _id)
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: 'invalid updates!' })
    }

    try{
        //update will bypass mongoose middleware, so we need to do this instead...
        //const user = await User.findById(req.params.id)
        updates.forEach((update) => {
            //use bracket notation to access attribute DYNAMICALLY
            req.user[update] = req.body[update]
        })
        await req.user.save()

        //mongoose method to update => the update ones
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators:true })
        //3 things could happen, update went well, went poorly, or user to update doesnt exist
    
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

//DELETE existing resourse
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id) //we attached the user to the request object through the middleware (auth)
        // if(!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router