// Minimal request-body validation without extra dependencies.
// Usage: validate({ email: 'email', password: { type: 'string', min: 6 } })
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function check(value, rule) {
  if (typeof rule === 'string') rule = { type: rule }
  const { type = 'string', required = true, min, max } = rule
  if (value === undefined || value === null || value === '') return required ? 'is required' : null

  if (type === 'email') {
    if (typeof value !== 'string' || !EMAIL.test(value)) return 'must be a valid email'
  } else if (type === 'string') {
    if (typeof value !== 'string') return 'must be text'
    if (min && value.trim().length < min) return `must be at least ${min} characters`
    if (max && value.length > max) return `must be at most ${max} characters`
  } else if (type === 'number') {
    const n = Number(value)
    if (!Number.isFinite(n)) return 'must be a number'
    if (min !== undefined && n < min) return `must be at least ${min}`
    if (max !== undefined && n > max) return `must be at most ${max}`
  } else if (type === 'array') {
    if (!Array.isArray(value)) return 'must be a list'
    if (min && value.length < min) return `must have at least ${min} item(s)`
  }
  if (rule.oneOf && !rule.oneOf.includes(value)) return `must be one of: ${rule.oneOf.join(', ')}`
  return null
}

module.exports = (schema) => (req, res, next) => {
  for (const [field, rule] of Object.entries(schema)) {
    const problem = check(req.body?.[field], rule)
    if (problem) return res.status(400).json({ message: `${field} ${problem}` })
  }
  next()
}
