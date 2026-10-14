// Base URL of the backend. Empty in development (Vite proxies /api and /socket.io).
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const getToken = () => {
  try { return localStorage.getItem('mg_token') } catch { return null }
}

const req = async (method, path, body, isForm = false) => {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!isForm && body) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method, headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    })
  } catch {
    return { ok: false, status: 0, data: { message: 'Network error — check your connection' } }
  }
  let data
  try { data = await res.json() } catch { data = {} }
  // Expired / revoked session: let AuthContext log the user out
  if (res.status === 401 && token) window.dispatchEvent(new Event('auth:expired'))
  return { ok: res.ok, status: res.status, data }
}

export const ROUTES = {
  login: '/auth/login',
  register: '/auth/register',

  forgotPassword: '/auth/forgotpassword',
  verifyOtp: '/auth/verifyotp',
  resetPassword: '/auth/resetpassword',

  products: '/products',
  product: (id) => `/products/${id}`,
  forYou: '/products/for-you',
  topPicks: '/products/top-picks',

  restaurants: '/restaurants',
  restaurant: (id) => `/restaurants/${id}`,
  restaurantMenu: (id) => `/restaurants/${id}/menu`,
  reviewSummary: (id) => `/restaurants/${id}/review-summary`,
  adminCreateRestaurant:   '/restaurants',
  adminUpdateRestaurant:   (id) => `/restaurants/${id}`,

  profile: '/profile',
  changePassword: '/profile/changePassword',
  addresses: '/profile/addresses',
  address: (id) => `/profile/addresses/${id}`,

  cart: '/cart',
  cartItem: (id) => `/cart/${id}`,

  orders: '/orders',
  order: (id) => `/orders/${id}`,
  quote: '/orders/quote',
  createOrder: '/orders/create',
  reorder: (id) => `/orders/${id}/reorder`,
  cancelOrder: (id) => `/orders/${id}/cancel`,
  confirmReceived: (id) => `/orders/${id}/delivered`,
  coupons: '/coupons',

  payKhalti: '/payment',
  payEsewa: '/payment/esewa',
  deliveryEstimate: '/delivery/estimate',

  myReviews: '/reviews/reviews',
  productReviews: (id) => `/reviews/reviews/${id}`,
  createReview: (id) => `/reviews/reviews/${id}`,
  deleteReview: (id) => `/reviews/reviews/${id}`,
  reportReview: (id) => `/reviews/reviews/${id}/report`,

  aiChat: '/ai/chat',

  adminUsers: '/admin/users',
  adminUser: (id) => `/admin/users/${id}`,
  allOrders: '/admin/orders',
  updateStatus: (id) => `/admin/orders/${id}/status`,
  adminRefund: (id) => `/admin/orders/${id}/refund`,
  adminOrdersCsv: '/admin/orders/export.csv',
  adminStats: '/admin/stats',
  adminPayouts: '/admin/payouts',
  adminSettings: '/admin/settings',
  adminApproveRestaurant: (id) => `/admin/restaurants/${id}/approval`,
  adminCoupons: '/admin/coupons',
  adminCoupon: (id) => `/admin/coupons/${id}`,
  adminReportedReviews: '/admin/reviews/reported',
  adminReview: (id) => `/admin/reviews/${id}`,
}

// Download a file from an authenticated endpoint
export async function download(path, filename) {
  const token = getToken()
  const res = await fetch(`${API_BASE}/api${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!res.ok) return false
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
  return true
}

export const api = {
  get:      (path)       => req('GET',    path),
  post:     (path, body) => req('POST',   path, body),
  patch:    (path, body) => req('PATCH',  path, body),
  put:      (path, body) => req('PUT',    path, body),
  delete:   (path)       => req('DELETE', path),
  postForm: (path, fd)   => req('POST',   path, fd, true),
  patchForm:(path, fd)   => req('PATCH',  path, fd, true),
  putForm:  (path, fd)   => req('PUT',    path, fd, true),
}
export default api
