import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const { token } = useAuth()

  useEffect(() => {
    if (token) fetchCart()
    else setCartItems([])
  }, [token])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', { headers: { Authorization: token } })
      const data = await res.json()
      if (res.ok) setCartItems(data.data || [])
    } catch {}
  }

  const addToCart = async (productId) => {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'POST',
      headers: { Authorization: token }
    })
    if (res.ok) fetchCart()
    return res
  }

  const removeFromCart = async (productId) => {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    })
    if (res.ok) fetchCart()
    return res
  }

  return (
    <CartContext.Provider value={{ cartItems, cartCount: cartItems.length, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)