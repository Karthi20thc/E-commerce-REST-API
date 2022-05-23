const nodemailer = require("nodemailer");

const sendEMail = async (options) => {
  // 1.  create Transporter
  const transporter = nodemailer.createTransport({
    // To send email using gmail service----------------------
    // service: "gmail",
    // auth: {
    //   user: process.env.EMAIL_USERNAME, // to send email from my address to all users (clients) using my application
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    // // activate in Gmail 'less secure app' option

    // using mailtrap.io for test puropses--------------------
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME, // to send email from my address to all users (clients) using my application
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. define email options

  const mailOptions = {
    from: "Karthik <admin@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3. Actually send email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEMail;
