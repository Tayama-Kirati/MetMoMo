const jwt  = require('jsonwebtoken')
const User = require('../models/userModel')

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.userEmail }, process.env.SECRET_KEY, { expiresIn: EXPIRES_IN })
}

class AuthError extends Error {}

// Returns the user for a raw token ("Bearer x" or "x"); throws AuthError otherwise
async function verifyToken(raw) {
  const token = String(raw || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) throw new AuthError('Please Login first')

  let decoded
  try {
    decoded = jwt.verify(token, process.env.SECRET_KEY)
  } catch {
    throw new AuthError('Session expired. Please log in again.')
  }

  const user = await User.findById(decoded.id)
  if (!user) throw new AuthError('User does not exist')
  if (decoded.email && user.userEmail !== decoded.email) throw new AuthError('Token email mismatch. Please log in again.')
  if (user.isBlocked) throw new AuthError('Your account has been blocked')
  // Tokens issued before the last password change are no longer valid
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime() - 1000) {
    throw new AuthError('Password changed. Please log in again.')
  }
  return user
}

module.exports = { signToken, verifyToken, AuthError }
