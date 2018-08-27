const h = require('./helpers')

// parameter usage
// 0 => allSockets
// 1 => socket
// 2 => msg
// 3 => chatroom

// create new chatroom
const create = (...params) => {
  const [, socket, msg] = params
  let chatrooms = params[3]

  // chat name
  const [, ...chatName] = msg

  // no name specified
  if (chatName.length === 0) {
    h.serverReply(socket, 'Please enter a chatroom name. ex. /create My Chatroom.')
    return
  }

  // check if user has created a chatroom already
  if (socket.own) {
    let reply = [
      'You have already created a chatroom.',
      'To delete it, the command is /remove'
    ]
    h.serverReply(socket, reply.join('\r\n* '))
    return
  }
  const newName = chatName.join('_')
  if (chatrooms.has(newName)) {
    h.serverReply(socket, 'A chatroom with that name already exists.')
    return
  }
  // create new chatroom
  let newChat = {
    // name: chatName.join('_'),
    creator: socket.nickname,
    users: []
  }
  chatrooms.set(newName, newChat)
  // what chatroom the socket owns
  socket.own = newName
  h.serverReply(socket, `New chatroom "${newName}" created. To join, type /join "${newName}"`)
}

// lists all existing chatrooms
const rooms = (...params) => {
  let reply = []
  const chatrooms = params[3]
  for (const [name, data] of chatrooms.entries()) {
    reply.push(`${name} (${data.users.length})`)
  }
  reply.push('end of list.')
  h.serverReply(params[1], reply.join('\r\n* '))
}

// lists all users in current chatroom
const here = (...params) => {
  let reply = []
  const [, socket, , chatrooms] = params
  if (socket.current) {
    const room = socket.current
    for (const user of chatrooms.get(room).users) {
      if (user === socket.nickname) {
        reply.push(user + ' (you)')
      } else {
        reply.push(user)
      }
    }
    h.serverReply(socket, reply.join('\n* '))
    h.serverReply(socket, 'end of list.')
  } else {
    h.serverReply(socket, 'You are currently not in a chatroom.')
  }
}

// join an existing chatroom
const join = (...params) => {
  const [allSockets, socket, msg] = params
  let chatrooms = params[3]

  const [, ...chatName] = msg

  // no chatroom entered
  if (chatName.length === 0) {
    h.serverReply(socket, 'Please enter the chatroom you would like to join. For a list of chatrooms, the command is /rooms.')
  }

  // check if chatroom exists, if so, add this user to it.
  const name = chatName.join('_')
  if (chatrooms.has(name)) {
    if (socket.current) {
      leave(...params)
    }

    // add user onto new chatroom
    const newChat = chatrooms.get(name)
    newChat.users.push(socket.nickname)
    socket.current = name
    h.serverReply(socket, `Joining ${name}...`)

    // printing current users in the chat
    for (const user of newChat.users) {
      if (user === socket.nickname) {
        h.serverReply(socket, user + ' (you)')
      } else {
        h.serverReply(socket, user)
      }
    }
    for (const user of newChat.users) {
      if (user !== socket.nickname) {
        h.serverReply(h.getSocketByName(allSockets, user), `"${socket.nickname}" has joined that chatroom. Say hi!`)
      } else {
        h.serverReply(socket, `You have now joined ${socket.current}. Feel free to start chatting!`)
      }
    }
  } else {
    // no chatroom with given name found
    h.serverReply(socket, `The chatroom "${name}" was not found. Please check again.`)
  }
}

const leave = (...params) => {
  const [allSockets, socket, , chatrooms] = params
  // leave chatroom if user is in one
  const currentChat = chatrooms.get(socket.current)
  currentChat.users.splice(currentChat.users.indexOf(socket.nickname), 1)
  for (const user of currentChat.users) {
    h.serverReply(h.getSocketByName(allSockets, user), `"${socket.nickname}" has left the chatroom.`)
  }
  h.serverReply(socket, `Leaving ${socket.current}...`)
  socket.current = null
}

// delete users chatroom
const remove = (...params) => {
  const [allSockets, socket, msg] = params
  let chatrooms = params[3]
  const [, ...chatName] = msg

  // no chatroom entered
  if (chatName.length === 0) {
    h.serverReply(socket, 'Please enter your chatroom name. We require you to type the chatroom name to prevent accidents.')
    return
  }

  const name = chatName.join('_')
  if (chatrooms.has(name)) {
    let room = chatrooms.get(name)

    // need copySocket since only one socket can be at a chatroom at a time, so once they are
    // deleted, it would be redundant to check for that same socket.
    let copySockets = allSockets
    for (const r of room.users) {
      for (const s of copySockets) {
        // notify all users in room that it is being deleted
        if (r === s.nickname && s.nickname !== socket.nickname) {
          s.current = null
          h.serverReply(s, 'The owner is deleting the chatroom. You are now being removed.')
          copySockets.splice(copySockets.indexOf(s), 1)
        }
      }
    }
    chatrooms.delete(name)
    socket.own = null
  } else {
    h.serverReply(socket, 'You have typed your chatroom name wrong. We require you to type the chatroom name to prevent accidents.')
  }
}

module.exports = {
  create: create,
  rooms: rooms,
  here: here,
  join: join,
  leave: leave,
  remove: remove
}
