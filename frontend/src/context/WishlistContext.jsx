import { createContext, useContext, useState, useEffect } from 'react'
const WishlistContext = createContext(null)
export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mg_wishlist') || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('mg_wishlist', JSON.stringify(wishlist)) }, [wishlist])
  const toggle = (product) => {
    setWishlist(prev => prev.find(p => p._id === product._id)
      ? prev.filter(p => p._id !== product._id)
      : [...prev, product])
  }
  const isWishlisted = (id) => wishlist.some(p => p._id === id)
  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  )
}
export const useWishlist = () => useContext(WishlistContext)