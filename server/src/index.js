const net = require('net')
const commands = require('./commands')

const prefix = '/'
// let sockets = []
let sockets = new Map()

// puts message from one socket to all other connected sockets
const receiveData = (sockets, socket, data) => {
  // tell user there is no one to chat to
  // if (sockets.length === 1) {
  //   socket.write('There is no one in the server.\n')
  //   return
  // }
  if (socket.size === 1) {
    socket.write('There is no one in the server.\n')
    return
  }
  // send message to everyone except itself
  for (const s of sockets.values()) {
    if (s !== socket) {
      s.write(data)
    }
  }
}

// removes socket when somoene leaves
const closeSocket = (socket) => {
  for (const s of sockets.keys()) {
    if (sockets.s === socket) {
      sockets.delete(s)
    }
  }
}

// clears data of any new line or carriage return characters
const cleanInput = (data) => {
  return data.toString().replace(/(\r\n|\n|\r)/gm, '')
}

const newSocket = (socket) => {
  socket.write('Welcome to the Telnet server!\n')

  // get nickname from new socket
  let getName = true
  socket.write('Login Name?\n')

  // comes here whenever a message is sent
  socket.on('data', (data) => {
    // let message = userReply(data)
    const cleanData = cleanInput(data)
    if (getName) {
      if (sockets.has(cleanData)) {
        socket.write('Sorry, name taken.\n')
        socket.write('Login Name?\n')
      } else {
        getName = false
        sockets.set(cleanData, socket)
        socket.write(`Welcome, ${cleanData}!\n`)
      }
      return
    }

    // finds commands
    const firstLetter = cleanData.substring(0, 1)
    if (firstLetter === prefix) {
      // splits message by space
      const messageArray = cleanData.trim().split(' ').filter((element) => {
        return element !== ''
      })
      const command = messageArray[0]
      if (command.indexOf(prefix) === 0) {
        // removes the prefix symbol and checks if command exists for the bot
        let commandExists = commands[command.slice(prefix.length)]
        if (commandExists) {
          commandExists(sockets, socket, data)
        }
      }
      return
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
