import { useEffect } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

let socket = null

export function useNotifications(userId) {
  useEffect(() => {
    if (!userId) return

    socket = io('http://localhost:4000', { transports: ['websocket'] })

    socket.on('connect', () => {
      socket.emit('join', userId)
    })

    socket.on('order:status', ({ title, body, status }) => {
      const icons = { confirmed: '✅', ontheway: '🛵', delivered: '🏠', cancelled: '❌' }
      const icon  = icons[status] || '📦'
      toast(`${icon} ${title} — ${body}`, {
        duration: 6000,
        style: {
          background: '#2D1B25',
          color: '#FFF9FB',
          borderRadius: '20px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          border: '1px solid rgba(255,45,120,0.3)',
          padding: '14px 18px',
        },
      })
    })

    return () => {
      socket?.disconnect()
      socket = null
    }
  }, [userId])
}
