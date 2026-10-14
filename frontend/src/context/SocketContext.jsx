import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import { API_BASE } from '../services/api'

const SocketContext = createContext(null)

const ICONS = { confirmed: '✅', preparation: '👩‍🍳', ontheway: '🛵', delivered: '🏠', cancelled: '❌' }

// System notification when the tab is in the background (needs permission)
export function showSystemNotification(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return
    navigator.serviceWorker?.ready
      .then(reg => reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png' }))
      .catch(() => new Notification(title, { body }))
  } catch {}
}

export function SocketProvider({ children }) {
  const { token, user } = useAuth()
  const userId = user?._id
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!token || !userId) return
    const s = io(API_BASE || undefined, { auth: { token }, transports: ['websocket'] })
    setSocket(s)

    s.on('order:status', ({ title, body, status }) => {
      toast(`${ICONS[status] || '📦'} ${title} — ${body}`, { duration: 6000 })
      showSystemNotification(title, body)
    })

    return () => { s.disconnect(); setSocket(null) }
  }, [token, userId])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

// Subscribe to a socket event for the lifetime of a component
export function useSocketEvent(event, handler) {
  const socket = useContext(SocketContext)
  useEffect(() => {
    if (!socket) return
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [socket, event, handler])
  return socket
}

export const useSocket = () => useContext(SocketContext)
