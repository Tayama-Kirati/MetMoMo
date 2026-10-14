// Central error handler: turns known error types into clean JSON responses.
module.exports = (err, req, res, next) => {
  let status  = err.status || err.statusCode || 500
  let message = err.message || 'Internal server error'

  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}` }
  else if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map(e => e.message).join(', ')
  }
  else if (err.code === 11000) {
    status = 409
    message = `${Object.keys(err.keyValue || {}).join(', ') || 'Value'} already exists`
  }
  else if (err.name === 'MulterError') {
    status = 400
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : err.message
  }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON body' }

  if (status >= 500) {
    console.error(err)
    if (process.env.NODE_ENV === 'production') message = 'Internal server error'
  }
  res.status(status).json({ message })
}
