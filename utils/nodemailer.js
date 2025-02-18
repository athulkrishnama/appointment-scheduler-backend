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

const sendServiceProviderBlockMail = async(serviceProvider, payoutLink) => {
    const mailOptions = {
        from: process.env.GOOGLE_MAIL,
        to: serviceProvider.email,
        subject: "Account Blocked",
        text: `Your account has been blocked by admin, contact admin for more details\nyou can unblock your account by visiting this link ${payoutLink}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log("Error sending email:", error);
        return false
    }
}

const sendMailer = async (to , subject, content) => {
    try{
        const mailOptions = {
            from: process.env.GOOGLE_MAIL,
            to,
            subject,
            text: content,
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.log("Error sending email:", error);
        return false
    }
}

module.exports = {sendMail,sendServiceProviderBlockMail,sendMailer}