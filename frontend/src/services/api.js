const getToken = () => localStorage.getItem('mg_token')

const req = async (method, path, body, isForm = false) => {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = token
  if (!isForm && body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`/api${path}`, {
    method, headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  })
  let data
  try { data = await res.json() } catch { data = {} }
  return { ok: res.ok, status: res.status, data }
}
 

export const ROUTES = {
 
  products:         '/products/product',        
  product: (id)  => `/products/product/${id}`,  

  // Auth
  login:           '/auth/login',
  register:        '/auth/register',
  forgotPassword:  '/auth/forgotpassword',
  verifyOtp:       '/auth/verifyotp',
  resetPassword:   '/auth/resetpassword',

  // Profile
  profile:         '/profile',
  changePassword:  '/profile/changePassword',

  // Cart
  cart:            '/cart',
  cartItem: (id) => `/cart/${id}`,

  // Orders
  orders:          '/orders',
  createOrder:     '/orders/create',
  allOrders:       '/orders/all',

  // Reviews
  myReviews:            '/reviews/reviews',
  productReviews: (id)=> `/reviews/reviews/${id}`,
  createReview:   (id)=> `/reviews/reviews/${id}`,
  deleteReview:   (id)=> `/reviews/reviews/${id}`,

  // Admin
  adminUsers:         '/admin/users',
  adminUser: (id)  => `/admin/users/${id}`,
}

export const api = {
  get:       (path)       => req('GET',    path),
  post:      (path, body) => req('POST',   path, body),
  patch:     (path, body) => req('PATCH',  path, body),
  delete:    (path)       => req('DELETE', path),
  postForm:  (path, fd)   => req('POST',   path, fd, true),
  patchForm: (path, fd)   => req('PATCH',  path, fd, true),
}

export default api