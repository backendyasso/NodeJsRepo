import nodemailer from "nodemailer";
// export function sendEmail(destination, message) {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//       user: "nourhanroutenodejs@gmail.com",
//       pass: "dkondkitwvytfhne",
//     },
//   });

//   // async..await is not allowed in global scope, must use a wrapper

//   async function main() {
//     // send mail with defined transport object
//     const info = await transporter.sendMail({
//       from: "nourhanroutenodejs@gmail.com", // sender address
//       to: destination,
//       text: "confirm your email", // Subject line, // plain text body
//       html: message, // html body
//     });
//   }
// }

export async function sendEmail({ dest, subject, message, attachments = [] }) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nourhanroutenodejs@gmail.com", // generated ethereal user
      pass: "dkondkitwvytfhne", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Route" <"nourhanroutenodejs@gmail.com">`, // sender address
    to: dest, // list of receivers
    subject, // Subject line
    html: message, // html body
    attachments,
  });
  return info;
}
