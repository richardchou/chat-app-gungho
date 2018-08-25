const net = require('net')
const commands = require('./commands')
const h = require('./helpers')

const prefix = '/'
// let sockets = new Map()
let sockets = []
// let chatrooms = []
let chatrooms = new Map()

// puts message from one socket to all other connected sockets
const sendMessage = (socket, data) => {
  // tell user there is no one to chat to
  if (sockets.length === 1) {
    h.serverReply(socket, 'There is no one in the chatroom.')
    return
  }

  // if user owns the channel, they will have special indicator
  const room = chatrooms.get(socket.current)
  // send message to everyone except themselves
  for (const user of room.users) {
    if (user !== socket.nickname) {
      const isOwn = socket.nickname === room.creator
      if (isOwn) {
        h.userReply(h.getSocketByName(sockets, user), socket.nickname + ' (owner)', data)
      } else {
        h.userReply(h.getSocketByName(sockets, user), socket.nickname, data)
      }
    }
  }
}

// removes socket when somoene leaves
const closeSocket = (socket) => {
  // remove chatroom that socket owns
  if (socket.own) {
    if (socket.current === socket.own) socket.current = null

    let copySockets = sockets
    const room = chatrooms.get(socket.own)
    for (const r of room.users) {
      for (const s of copySockets) {
        // notify all users in room that it is being deleted
        if (r === s.nickname && s.nickname !== socket.nickname) {
          s.current = null
          h.serverReply(s, 'The owner has left the server. Their chatroom has been removed.')
          copySockets.splice(copySockets.indexOf(s), 1)
        }
      }
    }
    chatrooms.delete(socket.own)
  }

  // remove socket from current chatroom
  if (socket.current) {
    let room = chatrooms.get(socket.current)
    for (const user of room.users) {
      if (user === socket.nickname) {
        room.users.splice(room.users.indexOf())
      }
    }
  }

  // delete from socket list
  for (const s of sockets) {
    if (s === socket) {
      sockets.pop(s)
    }
  }
}

// clears data of any new line or carriage return characters
const cleanInput = (data) => {
  return data.toString().replace(/(\r\n|\n|\r)/gm, '')
}

// additions to socket
// socket.nickname = the nickname of this socket
// socket.own = the chatroom this socket has created
// socket.current = the current chatroom this socket is in
const newSocket = (socket) => {
  h.serverReply(socket, 'Welcome to the Telnet server!')
  // get nickname from new socket
  h.serverReply(socket, 'Login name?')

  // comes here whenever a message is sent
  socket.on('data', (data) => {
    const cleanData = cleanInput(data)

    // splits message by space
    const messageArray = cleanData.trim().split(' ').filter((element) => {
      return element !== ''
    })

    // checks if user has entered a command
    const firstLetter = cleanData.substring(0, 1)
    if (firstLetter === prefix) {
      // names cannot look like commands
      if (!socket.nickname) {
        h.serverReply(socket, 'Sorry, your name cannot start with a slash.')
        return
      }

      const command = messageArray[0]
      if (command.indexOf(prefix) === 0) {
        // removes the prefix symbol and checks if command exists for the bot
        let commandExists = commands[command.slice(prefix.length)]
        if (commandExists) {
          commandExists(sockets, socket, messageArray, chatrooms)
        } else {
          h.serverReply(socket, 'Sorry, but the command you are looking for does not exist. Try again.')
        }
      }
      return
    }

    // user did not send a command, check if user has nickname
    if (!socket.nickname) {
      // one word names
      if (messageArray.length > 1) {
        h.serverReply(socket, 'Sorry, your name must be one word.')
        return
      }

      // check if nickname exists
      for (const s of sockets) {
        if (s.nickname === cleanData) {
          h.serverReply(socket, 'Sorry, name taken.')
          h.serverReply(socket, 'Login Name?')
          return
        }
      }

      // nickname not taken, create new user/socket
      socket.nickname = cleanData
      sockets.push(socket)
      h.serverReply(socket, `Welcome, ${cleanData}!`)
      h.serverReply(socket, 'Try out some commands with /commands.')
      return
    }

    // if thi user is not in a chatroom
    if (!socket.current) {
      h.serverReply(socket, 'You are not in a chatroom. Find a chatroom with /room and start chatting!')
    } else {
      // send message to other sockets in current chatroom
      sendMessage(socket, cleanData)
    }
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
