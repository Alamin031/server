import * as nodemailer from 'nodemailer';

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<string> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        reject('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        resolve('Email sent');
      }
    });
  });
}
