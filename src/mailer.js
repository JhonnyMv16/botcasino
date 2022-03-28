var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'magno.r.dev@gmail.com',
        pass: 'timao12345'
    }
});

function send(email, message) {
    transporter.sendMail({
        from: 'magno.r.dev@gmail.com',
        to: email,
        subject: 'Robo bet',
        text: message
    }, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}

module.exports = {
    send
}