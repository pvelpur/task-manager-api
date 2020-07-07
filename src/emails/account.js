// Will contain all the code for sending emails related to user accounts (like signing up or deleting)
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//EXAMPLE
// sgMail.send({
//     to: 'prithvi180@gmail.com',
//     from: 'prithvi180@gmail.com',
//     subject: "This is my First mail creation",
//     text: 'Hey, whats up'
// })

sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'prithvi180@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'prithvi180@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. Do let us know how we could have made you stay longer.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}