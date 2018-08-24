const net = require('net')
const commands = require('./commands')

const prefix = '/'
let sockets = []

// puts message from one socket to all other connected sockets
const receiveData = (allSockets, socket, data) => {
  // tell user there is no one to chat to
  if (allSockets.length === 1) {
    socket.write('There is no one in the server.\n')
    return
  }

  // send message to everyone except itself
  for (let i = 0; i < allSockets.length; i++) {
    if (allSockets[i] !== socket) {
      allSockets[i].write(data)
    }
  }
}

// removes socket when somoene leaves
const closeSocket = (socket) => {
  let i = sockets.indexOf(socket)
  if (i !== -1) {
    sockets.splice(i, 1)
  }
}

// clears data of any new line or carriage return characters
const cleanInput = (data) => {
  return data.toString().replace(/(\r\n|\n|\r)/gm, '')
}

const newSocket = (socket) => {
  sockets.push(socket)
  socket.write('Welcome to the Telnet server!\n')

  // comes here whenever a message is sent
  socket.on('data', (data) => {
    // let message = userReply(data)
    const cleanData = cleanInput(data)

    // splits message by space
    const messageArray = cleanData.trim().split(' ').filter((element) => {
      return element !== ''
    })

    // finds for commands
    const command = messageArray[0]
    if (command.indexOf(prefix) === 0) {
      // removes the prefix symbol and checks if command exists for the bot
      let commandExists = commands[command.slice(prefix.length)]
      if (commandExists) {
        commandExists(sockets, socket, data)
      }
    }

    // send message to other sockets
    receiveData(sockets, socket, data)
  })

  // when session is terminated, run this action
  socket.on('end', () => {
    closeSocket(socket)
  })

  // on socket error
  socket.on('error', (err) => {
    console.log(`Socket got an error: ${err.message}`)
  })
}

const server = net.createServer(newSocket)

server.listen(3000)
