const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()



router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        //ES6 spread operator (...) brings in everything that comes after
        ...req.body,
        owner: req.user._id
    })
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
    //ASYNC/AWAIT
    try{
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})

// FILTERING
// GET /tasks?completed=true
// PAGINATION => limit and skip
// GET /tasks?limit=10&skip=0
//SORTING
// GET /tasks?sortBy=createdAt_desc (or asc) (ascending vs descending)
router.get('/tasks', auth, async (req, res) => {
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((e) => {
    //     res.status(500).send()
    // })

    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = (req.query.completed === 'true')
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }

    //ASYNC/AWAIT
    try{
        //const tasks = await Task.find({owner: req.user._id}) // One way to do it
        //Other way (right way)
        await req.user.populate({
            path: 'tasks',
            //for filtering
            match,
            //for pagination
            options: {
                limit: parseInt(req.query.limit), //if it's not provided or not a number, itll be ignored by mongoose
                skip: parseInt(req.query.skip),
                sort: sort /*{
                    completed: 1 //ascending
                    //createdAt: -1 //descending
                }*/
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    // Task.findById(_id).then((task) => {
    //     if(!task){
    //         return res.status(400).send()
    //     }
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send()
    // })
    //ASYNC/AWAIT
    try{
        //const task = await Task.findById(_id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send({error: 'Invalid Updates!'})
    }
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        //const task = await Task.findById(req.params.id)

        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        if(!task){
            res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e) {
        res.status(400).send()
    }
    
})

//DELETE existing resourse
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router