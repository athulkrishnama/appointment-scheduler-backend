const User = require("../models/user");
const sendMail = require("../utils/nodemailer");
const signup = async (req, res) => {
  try {
    try {
      const { fullname, email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ success: false, message: "User already exists" });
      }
      const otp = Math.floor(100000 + Math.random() * 900000);
      const emailsent = await sendMail(email, otp);

      // check if email was sent
      if (!emailsent) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to send email" });
      }

      console.log(`Email sent to ${email} otp: ${otp}`);

      req.session.user = { fullname, email, password, role };
      req.session.otp = otp;
      req.session.otpExpiry = Date.now() +  60 * 1000; 
      res.status(200).json({ success: true, message: "Otp sent successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create user" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};


// verify otp

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(otp, req.session.otp);
    if (req.session.otp != otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }
    if (Date.now() > req.session.otpExpiry) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired" });
    }
    const user = req.session.user;
    const newUser = new User(user);
    await newUser.save();
    req.session.destroy();
    res.status(200).json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.session.user;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const emailsent = await sendMail(email, otp);
    if (!emailsent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email" });
    }
    console.log(`Email sent to ${email} otp: ${otp}`);
    req.session.otp = otp;
    req.session.otpExpiry = Date.now() +  60 * 1000; 
    res.status(200).json({ success: true, message: "Resended otp sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to resend otp" });
  }
}
module.exports = { signup, verifyOtp, resendOtp };
