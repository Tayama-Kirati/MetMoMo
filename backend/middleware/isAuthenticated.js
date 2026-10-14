const { verifyToken } = require("../services/tokens");

const isAuthenticated = async (req, res, next) => {
  try {
    req.user = await verifyToken(req.headers.authorization);
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || "Not authorized" });
  }
};

module.exports = isAuthenticated;
