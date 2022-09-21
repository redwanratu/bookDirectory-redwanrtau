const nodeMailer = require('nodeMailer');

const sendMail = async (options) => {
  // 1. create transporter
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2. define the options
  const emailOptions = {
    from: 'Redwan Ratu <redwanratu@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3. send the actual email
  await transporter.sendMail(emailOptions);
};

module.exports = sendMail;
