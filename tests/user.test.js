const request = require('supertest')
//get access to express application (before listen is called)
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, testUserOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should sign up a new user', async () => {
    //supertest uses promises
    const response = await request(app).post('/users').send({
        //sends data accross the wire (as the body)
        name: 'Prithvi',
        email: 'prithvi180@gmail.com',
        password: "Mypass124!"
    }).expect(201)

    // Assert the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    //expect(response.body.user.name).toBe('Prithvi')
    expect(response.body).toMatchObject({
        user: {
            name: 'Prithvi',
            email: 'prithvi180@gmail.com'
        },
        token: user.tokens[0].token
    })

    // Make sure that plain text password isn't saved to database
    expect(user.password).not.toBe('Mypass124!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: testUserOne.email,
        password: testUserOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login non existant user', async () => {
    await request(app).post('/users/login').send({
        email: testUserOne.email,
        password: 'somepassword12!'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`) //set headers
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for User', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthorized user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send({
            name: "Steve"
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Steve')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send({
            location: "Chicago"
        })
        .expect(400)

})

// Jest lifecycle methods => setup and teardown in docs