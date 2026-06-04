import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mg_wishlist') || '[]') } catch { return [] }
  })
  const [favRestaurants, setFavRestaurants] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mg_fav_restaurants') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('mg_wishlist', JSON.stringify(wishlist)) }, [wishlist])
  useEffect(() => { localStorage.setItem('mg_fav_restaurants', JSON.stringify(favRestaurants)) }, [favRestaurants])

  // Food items
  const toggle = (product) =>
    setWishlist(prev => prev.find(p => p._id === product._id)
      ? prev.filter(p => p._id !== product._id)
      : [...prev, product])
  const isWishlisted = (id) => wishlist.some(p => p._id === id)

  // Restaurants
  const toggleRestaurant = (restaurant) =>
    setFavRestaurants(prev => prev.find(r => r._id === restaurant._id)
      ? prev.filter(r => r._id !== restaurant._id)
      : [...prev, restaurant])
  const isFavRestaurant = (id) => favRestaurants.some(r => r._id === id)

  return (
    <WishlistContext.Provider value={{
      wishlist, toggle, isWishlisted,
      favRestaurants, toggleRestaurant, isFavRestaurant,
      count: wishlist.length + favRestaurants.length,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
