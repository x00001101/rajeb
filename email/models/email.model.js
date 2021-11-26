const nodemailer = require("nodemailer");

/*
 * SendEmail method sending email through smtp
 *
 * @params fields Array  email, type, url, key
 */
exports.sendEmail = (fields) => {
  let subject, contentTxt, contentHtml;
  if (fields.type == "EMAIL_VERIFICATION") {
    subject = "Account Email Verification (no-reply)";
    contentTxt = "copy this link and paste it on browser: " + fields.url;
    contentHtml = "copy this link and paste it on browser: " + fields.url;
  } else if (fields.type == "PASSWORD_RESET") {
    subject = "Reset Account Verification (no-reply)";
    contentTxt = "copy this link and paste it on browser: " + fields.url;
    contentHtml = "copy this link and paste it on browser: " + fields.url;
  }

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USERNAME,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    },
  });

  let mailOption = {
    from: process.env.EMAIL_USERNAME,
    to: fields.email,
    subject: subject,
    text: contentTxt,
    html: contentHtml,
  };

  transporter.sendMail(mailOption, (err) => {
    if (err) {
      console.log("Error: ", err);
    }
    console.log("Sent to ", mailOption.to);
  });
};
