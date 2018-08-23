const net = require('net')

let sockets = []

const receiveData = (socket, data) => {
  let cleanData = cleanInput(data)
  if (cleanData === '/quit') {
    socket.end('BYE\n')
  }
  for (let i = 0; i < sockets.length; i++) {
    if (sockets[i] !== socket) {
      sockets[i].write(data)
    }
  }
}

const closeSocket = (socket) => {
  let i = sockets.indexOf(socket)
  if (i !== -1) {
    sockets.splice(i, 1)
  }
}

// appends any server reply with <= characters
const serverReply = (reply) => {
  return '<= ' + reply
}

const cleanInput = (data) => {
  return data.toString().replace(/(\r\n|\n|\r)/gm, '')
}

const newSocket = (socket) => {
  sockets.push(socket)
  socket.write(serverReply('Welcome to the Telnet server!\n'))
  socket.on('data', (data) => {
    receiveData(socket, data)
  })
  socket.on('end', () => {
    closeSocket(socket)
  })
}

const server = net.createServer(newSocket)

server.listen(3000)
