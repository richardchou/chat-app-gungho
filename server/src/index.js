const net = require('net')
const commands = require('./commands')
const h = require('./helpers')

const prefix = '/'
let sockets = new Map()
let chatrooms = []

// puts message from one socket to all other connected sockets
const receiveData = (sockets, socket, data) => {
  // tell user there is no one to chat to
  if (socket.size === 1) {
    h.serverReply(socket, 'There is no one in the server.')
    return
  }
  // send message to everyone except itself
  for (const s of sockets.values()) {
    if (s !== socket) {
      h.serverReply(s, data)
    }
  }
}

// removes socket when somoene leaves
const closeSocket = (socket) => {
  // remove from chatroom

  // delete from socket list
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
  h.serverReply(socket, 'Welcome to the Telnet server!')
  // get nickname from new socket
  let getName = true
  h.serverReply(socket, 'Login name?')

  // comes here whenever a message is sent
  socket.on('data', (data) => {
    // let message = userReply(data)
    const cleanData = cleanInput(data)
    if (getName) {
      if (sockets.has(cleanData)) {
        h.serverReply(socket, 'Sorry, name taken.')
        h.serverReply(socket, 'Login Name?')
      } else {
        getName = false
        sockets.set(cleanData, socket)
        h.serverReply(socket, `Welcome, ${cleanData}!`)
        h.serverReply(socket, 'Try out some commands with /commands.')
      }
      return
    }

    // checks if user has entered a command
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
          commandExists(sockets, socket, messageArray, chatrooms)
        }
      }
      return
    }

    // send message to other sockets
    // receiveData(sockets, socket, data)
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
