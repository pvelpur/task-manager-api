const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value)  {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        },
        trim:true,
        lowercase:true
    },
    password: {
        type: String,
        validate(value) {
            if(value.toLowerCase().includes("password")) {
                throw new Error("Password cannot contain 'password'")
            }
        },
        required: true,
        trim: true,
        minlength: 7
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true // default option is false
})

//Virtual Property -> relationship btwn 2 entities
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// "Instance methods"
userSchema.methods.toJSON = function () {
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

//By setting up a value on schema.statics, we can access directly on model
// "Model methods"
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Middleware (mongoose docs)
//Below is so that before u save, do some function
// Cant use arrow functions, because we need to use a 'this' binding
// This will hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    //when the function is over, call next() so that the asynchronous process can finish
    //Not calling next will result in infinite loop
    next()
})

//Delete user tasks when the user is removed (cascade delete tasks)
userSchema.pre('remove', async function(next) {
    await Task.deleteMany({owner: this._id})
    next()
})

const User = mongoose.model('User', userSchema)

// const me = new User({
//     name: "   Prithvi   ",
//     email: 'PRITHVI180@gmail.com   ',
//     password: 'lolwhat5'
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log("Error!", error)
// })

module.exports = User