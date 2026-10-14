import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api, ROUTES } from '../services/api'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const { token } = useAuth()

  const fetchCart = useCallback(async () => {
    const { ok, data } = await api.get(ROUTES.cart)
    if (ok) setCartItems(data.data || [])
  }, [])

  useEffect(() => { token ? fetchCart() : setCartItems([]) }, [token, fetchCart])

  const addToCart = async (productId) => {
    const res = await api.post(ROUTES.cartItem(productId))
    if (res.ok) fetchCart()
    else toast.error(res.data?.message || 'Could not add to cart')
    return res
  }
  const removeFromCart = async (productId) => {
    const res = await api.delete(ROUTES.cartItem(productId))
    if (res.ok) fetchCart()
    return res
  }

  const setQuantity = async (productId, quantity) => {
    const res = await api.patch(ROUTES.cartItem(productId), { quantity })
    if (res.ok) fetchCart()
    else toast.error(res.data?.message || 'Could not update cart')
    return res
  }

  return (
    <CartContext.Provider value={{ cartItems, cartCount: cartItems.length, fetchCart, addToCart, removeFromCart, setQuantity }}>
      {children}
    </CartContext.Provider>
  )
}
export const useCart = () => useContext(CartContext)
