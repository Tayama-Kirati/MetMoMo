 
const restrictTo = (...userRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!userRoles.includes(req.user.userRole)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};

module.exports = restrictTo;