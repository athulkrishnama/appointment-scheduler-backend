const User = require("../models/user");
const sendMail = require("../utils/nodemailer");
const jwt = require("jsonwebtoken");
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


const login = async (req, res) => {
  try {
    const { email, password, googleId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "User is blocked" });
    }

    if (user.googleId) {


      const accessToken = jwt.sign(
        { id: user._id, email: user.email , role: user.role},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: user._id, email: user.email , role: user.role},
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      return res.status(200).json({
        success: true,
        message: "Google login successful",
        accessToken,
        user: {
          name: user.fullname,
          email: user.email,
          phone: user.phoneNumber,
        },
      });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email , role:user.role},
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email , role:user.role},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        name: user.fullname,
        email: user.email,
        phone: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};


const googleSignup = async (req, res) => {
  try {
    const { fullname, email, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    const newUser = new User({ fullname, email, role, googleId: true });
    await newUser.save();
    res.status(200).json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
}

// Route to refresh access token


module.exports = { signup, verifyOtp, resendOtp, login, googleSignup };
