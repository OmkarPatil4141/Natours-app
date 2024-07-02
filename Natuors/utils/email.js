const nodemailer = require('nodemailer');
// const { options } = require('../routes/userRoutes');
const { text } = require('express');

const sendEmail = async (options) =>{
    // 1. we have to create a transporter
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    // 2. we need to define email options 
    const mailOptions = {
        from:'Omkar Patil <patilomkarr4141@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
        // html

    }

    // 3. actual send the email with nodemailer

   await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;