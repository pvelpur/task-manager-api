const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim:true, required: true
    },
    completed: {type: Boolean, default:false,},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //mongoose referece to a model
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

// const task1 = new Task({
//     description: "  Homework  "
// })

// task1.save().then((res) => {
//     console.log(res)
// }).catch((error) => {
//     console.log("Error!", error)
// })

module.exports = Task