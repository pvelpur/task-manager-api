const request = require('supertest')
const Task = require('../src/models/task')
const app = require('../src/app')
const { 
    userOneId, 
    testUserOne, 
    setupDatabase, 
    testUserTwo, 
    taskOne 
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send({
            description: "From test suite :)"
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should get tasks for User 1 only', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Testing delete task security (test user 2 should not be able to delete task 1 owned by test user one)', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
        .send()
        .expect(404)

    //Assert that task is still in the database
    const task = Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})