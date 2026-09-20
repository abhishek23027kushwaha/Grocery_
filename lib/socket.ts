import { io } from 'socket.io-client'

// "undefined" means the URL will be computed from the `window.location` object
const URL = typeof window !== 'undefined' ? window.location.origin : ''

export const socket = io(URL, {
  path: '/api/socket',
  autoConnect: false, // Don't connect until we need it
})


