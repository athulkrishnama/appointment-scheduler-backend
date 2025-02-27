const ROLES = require("../constants/roles");
const STATUSES = require("../constants/statuses");
const User = require("../models/user");
const {sendMail} = require("../utils/nodemailer");
const jwt = require("jsonwebtoken");
const imageUploader = require("../helpers/imageUploader");
const signup = async (req, res) => {
  try {
    try {
      const { fullname, email, password, serviceDetails, role, phone } =
        req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ success: false, message: "User already exists" });
      }

      // sending otp
      const otp = Math.floor(100000 + Math.random() * 900000);
      const emailsent = await sendMail(email, otp);

      if (!emailsent) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to send email" });
      }

      console.log(`Email sent to ${email} otp: ${otp}`);

      req.session.user = {
        fullname,
        email,
        password,
        serviceDetails: serviceDetails && JSON.parse(serviceDetails),
        role,
        phone,
      };
      req.session.otp = otp;
      req.session.otpExpiry = Date.now() + 60 * 1000;
      const logo = req.files?.logo[0];
      const document = req.files?.document[0];
      req.session.logo = logo.buffer
      req.session.document = document.buffer
      

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
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > req.session.otpExpiry) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const user = req.session.user;

    if (user.role === ROLES.SERVICE) {
      const logo = req.session.logo;
      const document = req.session.document;
      const logoLink = await imageUploader.uploadLogo(logo);
      const documentLink = await imageUploader.uploadDocument(document)

      user.serviceDetails.logo = logoLink;
      user.serviceDetails.document = documentLink;
    }

    const newUser = new User(user);
    await newUser.save();

    req.session.destroy();
    res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

const resendOtp = async (req, res) => {
  try {
    if (!req.session.user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (req.session.otpExpiry > Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Otp not expired" });
    }
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
    req.session.otpExpiry = Date.now() + 60 * 1000;
    res
      .status(200)
      .json({ success: true, message: "Resended otp sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to resend otp" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, googleId, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "User is blocked" });
    }
    if (user.role !== role) {
      return res
        .status(400)
        .json({ success: false, message: "You are not a " + role });
    }

    if (
      user.role === ROLES.SERVICE &&
      user.serviceDetails.isAccepted === STATUSES.REJECTED
    ) {
      return res
        .status(400)
        .json({ success: false, message: "You are rejected by admin" });
    }

    if (
      user.role === ROLES.SERVICE &&
      user.serviceDetails.isAccepted === STATUSES.PENDING
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Your request is pending" });
    }
    if(user.googleId && !googleId){
      return res
        .status(400)
        .json({ success: false, message: "Please login with google" });
    }
    if (user.googleId && googleId) {
      const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
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
    res
      .status(200)
      .json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const user = await User.findById(decoded.id);
        if (!user) {
          return res
            .status(403)
            .json({ success: false, message: "Unauthorized" });
        }
        const accessToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        return res.status(200).json({ success: true, accessToken });
      }
    );
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to refresh token" });
  }
};

const forgetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const otp = Math.floor(100000 + Math.random() * 900000);
    const emailsent = await sendMail(email, otp);
    req.session.otp = otp;
    req.session.otpExpiry = Date.now() + 60 * 1000;
    req.session.email = email;
    if (!emailsent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email" });
    }
    console.log(`Email sent to ${email} otp: ${otp}`);
    res.status(200).json({ success: true, message: "Otp sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to generate otp" });
  }
};

const resendForgetPasswordOtp = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const emailsent = await sendMail(req.session.email, otp);
    req.session.otp = otp;
    req.session.otpExpiry = Date.now() + 60 * 1000;
    if (!emailsent) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email" });
    }
    console.log(`Email sent to ${req.session.email} otp: ${otp}`);
    res.status(200).json({ success: true, message: "Otp sent successfully" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to generate otp" });
  }
};

const verifyForgetPasswordOtp = async (req, res) => {
  try {
    if (req.session.otp !== req.body.otp) {
      return res.status(400).json({ success: false, message: "Invalid otp" });
    }
    if(Date.now() > req.session.otpExpiry) {
      return res.status(400).json({success: false, message: "Otp expired"})
    }
    req.session.otpVerified = true;
    res
      .status(200)
      .json({ success: true, message: "Otp verified successfully" });
  } catch (error) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to verify otp" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const {password, email} = req.body;
    if(!req.session.otpVerified || !password || !email) {
      return res.status(400).json({success: false, message: "Missing credentials"})
    }

    const user = await User.findOne({email});
    if(!user) return res.status(404).json({success: false, message: "User not found"})
    user.password = password;
    await user.save();
    res.status(200).json({success: true, message: "Password reset successfully"})
  } catch (error) {
    console.log(error)
    res.status(500).json({success: false, message: error.message || "Failed to reset password"})
  }
}

const updatePassword = async (req, res)=>{
  try {
    const {currentPassword, newPassword} = req.body;
    const user = await User.findById(req.userId);
    if(!user) return res.status(404).json({success: false, message: "User not found"})
    const isPasswordValid = await user.validatePassword(currentPassword);
    if(!isPasswordValid) return res.status(400).json({success: false, message: "Invalid current password"})
    user.password = newPassword;
    await user.save();
    res.status(200).json({success: true, message: "Password updated successfully"})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false, message:error.message ||"Failed to update password" })
  }
}
module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  googleSignup,
  refreshToken,
  forgetPasswordOtp,
  resendForgetPasswordOtp,
  verifyForgetPasswordOtp,
  resetPassword,
  updatePassword
};
