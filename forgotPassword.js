var express = require("express");
var nodemailer = require('nodemailer');
function forgotPassword() {
    import crypto from "crypto";
    const token = crypto.randomBytoes(20).toString('hex');
    console.log(token);
    app.post("/resetPassword", function (request, response) {
        response.send(token);
      });
    // var transporter = nodemailer.createTransport({
    //     host: "smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //         user: "d2c057524d03ff",
    //         pass: "44031373928ff5"
    //     }
    // });
    
    // var mailOptions = {
    //     from: 'nathanymlu@gmail.com',
    //     to: 'nathanymlu@gmail.com',
    //     subject: 'Sending Email using Node.js',
    //     text: 'Reset your password by clicking on the following link: '
    // };
    // transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });
}