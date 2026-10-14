const { verifyToken } = require("../services/tokens");

// Attaches req.user when a valid token is sent; never blocks the request
module.exports = async (req, res, next) => {
  if (req.headers.authorization) {
    try { req.user = await verifyToken(req.headers.authorization); } catch { /* treat as guest */ }
  }
  next();
};
