const jwt = require('jsonwebtoken');
const User = require('../models/user');
const verifyToken =async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ success: false, message: 'No token provided.' });
  }
  jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN_SECRET, async(err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
    }
    req.userId = decoded.id;
    const user = await User.findById(req.userId);
    console.log(user)
    console.log("decoded", decoded.role)
    if(decoded.role !== user.role){
      return res.status(400).json({ success: false, message: 'You are not a ' + user.role });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if(user.isActive === false){
      return res.status(400).json({ success: false, message: 'User is blocked.' });
    }
    next();
  });
};

module.exports = {verifyToken};