// config/emailConfig.js
const nodemailer = require('nodemailer');
require('dotenv').config()
// Create a transporter for your email service (e.g., Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

module.exports = transporter;
