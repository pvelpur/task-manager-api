const express = require('express')
require('./db/mongoose') //by just calling require it ensures that the file runs and connection is made
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

//register a new middleware function to run
// app.use((req, res, next) => {
//     //console.log(req.method, req.path)
//     if(req.method === 'GET') {
//         res.send('GET requests are disabled')
//     }
//     else{
//         next()
//     }
// }) 

//Maintenance mode (express middleware)
// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })

/****************************************************************/
// EXAMPLE USING MULTER => used for file uploads
// const multer = require('multer')
// const upload = multer({
//     //configurations
//     dest: 'images',
//     limits : {
//         fileSize: 1000000 // 1MB
//     },
//     fileFilter(req, file, cb) {
//         //using regex to match
//         if(!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('Please upload a word document'))
//         }
//         cb(undefined, true)

//         // cb(new Error('')) //if error
//         // cb(undefined, true) // if things go well and accept file
//         // cb(undefined, true) // if things go well but reject file
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({error: error.message})
// })

/****************************************************************/

//configure express to autimatically parse the incoming JSON for us
// so we have it accessible as a object we can use
app.use(express.json())

// //Creating a router
// const router = express.Router()
// //We will have several express routers that will combine into a single application
// // categorized by resource
// //example (basic structure)
// router.get('/test', async(req,res) => {
//     res.send("This is from my other router")
// })
// //need this to use router
// app.use(router)
app.use(userRouter)
app.use(taskRouter)

//
//  without middleware: new request -> run route handler
//
//  with middleware: new request -> do something (function that runs) -> run route handler
//

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

// //EXAMPLE (Seeing what the toJSON method call is doing)
// const pet = {
//    name: "Steve"
// }
// //This will manipulate the object to send back what u want before stingify is called
// pet.toJSON = function () {
//     return {}
// }
// console.log(JSON.stringify(pet))

//EXAMPLE (bcrypt)
// const bcrypt = require('bcryptjs')
// //Hashing via bcryptjs (npm package used to secure passwords)
// const myFunction = async () => {
//     const password = 'Red12345!' // Plain text password
//     const hashedPassword = await bcrypt.hash(password, 8) //8 is the number of rounds to run the hashing function

//     console.log(password)
//     console.log(hashedPassword)

//     //How login would work
//     const isMatch = await bcrypt.compare('red12345!', hashedPassword)
//     console.log(isMatch)
// }

//EXAMPLE (jsonwebtoken)
// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     //return value will be the authentication token
//     //First arguement is object that will be embedded in token (like user id)
//     const token = jwt.sign({ _id:'abc123' }, 'thisismynewtoken', { expiresIn: '15 seconds' })
//     console.log(token)

//     //verifying the token
//     const data = jwt.verify(token, 'thisismynewtoken')
//     console.log(data)
// }

//EXAMPLE (Populate)
// const Task = require('./models/task')
// const User = require('./models/user')
// const main = async () => {
//     //Take a task and find the user
//     // const task = await Task.findById('5ed05e00147dd7418ca1858e')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     //Find the tasks that the user owns
//     const user = await User.findById('5ed05ce67c99183944504e3e')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()

// myFunction()