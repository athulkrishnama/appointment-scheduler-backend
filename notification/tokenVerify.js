const jwt = require("jsonwebtoken");
const verifyToken = async (token) => {  
    try {
      const res = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return { success: true, userId: res.id };
    } catch (error) {
      return { success: false };
    }
  };
  
  module.exports = {
    verifyToken,
  };  