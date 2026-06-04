const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
 


const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Please Login first" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const doesUserExist = await User.findOne({ _id: decoded.id });

    if (!doesUserExist) {
      return res.status(401).json({ message: "User does not exist" });
    }

    if (decoded.email && doesUserExist.userEmail !== decoded.email) {
      return res.status(401).json({ message: "Token email mismatch. Please log in again." });
    }

    req.user = doesUserExist;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized",
      error: error.message,
    });
  }
};

module.exports = isAuthenticated;


 
