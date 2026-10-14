const h = require('./helpers')
const User = require('../models/userModel')

beforeAll(h.start)
afterAll(h.stop)
beforeEach(h.reset)

describe('auth', () => {
  test('register and login with case-insensitive email', async () => {
    const reg = await h.api().post('/api/auth/register').send({
      email: 'Ram@Test.com', userName: 'Ram', phoneNumber: '9801234567', password: 'secret123',
    })
    expect(reg.status).toBe(201)
    expect(reg.body.user.userRole).toBe('customer')

    const login = await h.api().post('/api/auth/login').send({ email: 'ram@test.com', password: 'secret123' })
    expect(login.status).toBe(200)
    expect(login.body.token).toBeTruthy()
  })

  test('cannot self-register as admin; riders need approval', async () => {
    const admin = await h.api().post('/api/auth/register').send({
      email: 'x@test.com', userName: 'X', phoneNumber: '9801234567', password: 'secret123', userRole: 'admin',
    })
    expect(admin.body.user.userRole).toBe('customer')

    const rider = await h.api().post('/api/auth/register').send({
      email: 'r@test.com', userName: 'R', phoneNumber: '9801234567', password: 'secret123', userRole: 'delivery_rider',
    })
    expect(rider.body.user.isApproved).toBe(false)
  })

  test('validation rejects bad input', async () => {
    const res = await h.api().post('/api/auth/register').send({ email: 'nope', userName: 'X', phoneNumber: '98', password: '1' })
    expect(res.status).toBe(400)
  })

  test('password reset requires a verified OTP', async () => {
    const { user } = await h.makeUser()

    // Attempt reset without OTP — the old account-takeover hole
    const direct = await h.api().post('/api/auth/resetpassword').send({
      email: user.userEmail, newPassword: 'hacked123', confirmPassword: 'hacked123',
    })
    expect(direct.status).toBe(403)

    const forgot = await h.api().post('/api/auth/forgotpassword').send({ email: user.userEmail })
    expect(forgot.status).toBe(200)
    expect(forgot.body.otp).toBeUndefined()   // never leaked in the response

    const { otp } = await User.findById(user._id).select('+otp')
    const wrong = await h.api().post('/api/auth/verifyotp').send({ email: user.userEmail, otp: 1 })
    expect(wrong.status).toBe(400)

    const ok = await h.api().post('/api/auth/verifyotp').send({ email: user.userEmail, otp })
    expect(ok.status).toBe(200)

    const reset = await h.api().post('/api/auth/resetpassword').send({
      email: user.userEmail, newPassword: 'newpass123', confirmPassword: 'newpass123',
    })
    expect(reset.status).toBe(200)

    const login = await h.api().post('/api/auth/login').send({ email: user.userEmail, password: 'newpass123' })
    expect(login.status).toBe(200)
  })

  test('old tokens stop working after a password change', async () => {
    const { user, token } = await h.makeUser()
    await new Promise(r => setTimeout(r, 1100))
    const change = await h.api().patch('/api/profile/changePassword').set('Authorization', token)
      .send({ oldPassword: 'password123', newPassword: 'another123', confirmPassword: 'another123' })
    expect(change.status).toBe(200)

    const old = await h.api().get('/api/profile').set('Authorization', token)
    expect(old.status).toBe(401)
    const fresh = await h.api().get('/api/profile').set('Authorization', `Bearer ${change.body.token}`)
    expect(fresh.status).toBe(200)
    expect(fresh.body.data.userPassword).toBeUndefined()
  })

  test('blocked users are rejected', async () => {
    const { token } = await h.makeUser('customer', { isBlocked: true })
    const res = await h.api().get('/api/profile').set('Authorization', token)
    expect(res.status).toBe(401)
  })
})

describe('admin routes', () => {
  test('require an admin', async () => {
    const anon = await h.api().get('/api/admin/users')
    expect(anon.status).toBe(401)

    const { token } = await h.makeUser('customer')
    const customer = await h.api().get('/api/admin/users').set('Authorization', token)
    expect(customer.status).toBe(403)
    const del = await h.api().delete('/api/admin/users/000000000000000000000000').set('Authorization', token)
    expect(del.status).toBe(403)

    const admin = await h.makeUser('admin')
    const ok = await h.api().get('/api/admin/users').set('Authorization', admin.token)
    expect(ok.status).toBe(200)
    expect(ok.body.data.every(u => u.userPassword === undefined)).toBe(true)
  })
})
