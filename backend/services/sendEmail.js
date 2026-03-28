const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: "Tayama Mukarung <tayamab2003@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  await transporter.sendMail(mailOptions);
};
 
module.exports = sendEmail;   