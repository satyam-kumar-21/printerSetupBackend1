const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendRegistrationEmail(data) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.CONTACT_RECEIVER_EMAIL,
    subject: 'New Printer Registration',
    text: `A new printer registration was submitted:\n\nModel: ${data.model}\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nAgreed to Policy: ${data.agree ? 'Yes' : 'No'}`,
    html: `<h2>New Printer Registration</h2><ul><li><b>Model:</b> ${data.model}</li><li><b>Name:</b> ${data.name}</li><li><b>Phone:</b> ${data.phone}</li><li><b>Email:</b> ${data.email}</li><li><b>Agreed to Policy:</b> ${data.agree ? 'Yes' : 'No'}</li></ul>`
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendRegistrationEmail };
