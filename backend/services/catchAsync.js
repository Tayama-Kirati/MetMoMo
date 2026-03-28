// 
// services/catchAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    try {
      // Call the controller function
      const result = fn(req, res, next);
      // If it returns a Promise (async function), attach .catch
      if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
        result.catch((err) => next(err));
      }
    } catch (err) {
      // Catch synchronous errors
      next(err);
    }
  };
};

