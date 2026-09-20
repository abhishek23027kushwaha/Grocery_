import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
  })

  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id)

    socket.on('join-order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order_${orderId}`);
    });

    socket.on('location-update', (data) => {
      // Broadcast to specific order room for user
      if (data.orderId) {
        io.to(`order_${data.orderId}`).emit('location-update', data);
      }
      // Also broadcast to admins as before
      io.emit('admin-location-update', data);
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected:', socket.id)
    })
  })

  // Assign the Socket.IO instance to a global variable so API routes can access it
  ;(global as any).io = io

  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})
