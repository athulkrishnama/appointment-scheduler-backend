const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com", 
    port: 465, 
    secure: true,
    auth: {
        user: process.env.GOOGLE_MAIL,
        pass: process.env.GOOGLE_PASSWORD,
    },
});

const sendMail = async (to, otp) => {
    const mailOptions = {
        from: process.env.GOOGLE_MAIL,
        to,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log("Error sending email:", error);
        return false
    }
}

module.exports = sendMail