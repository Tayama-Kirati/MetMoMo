const router = require('express').Router()
const catchAsync = require('../../services/catchAsync')
const { aiLimiter } = require('../../middleware/rateLimits')
const { chat } = require('../../controller/global/globalController')

router.post('/chat', aiLimiter, catchAsync(chat))

module.exports = router
