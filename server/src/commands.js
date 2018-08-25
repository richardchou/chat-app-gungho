const h = require('./helpers')

// parameter usage
// 0 => allSockets
// 1 => socket
// 2 => msg
// 3 => chatroom

// terminate telnet session
const quit = (...params) => {
  const socket = params[1]
  socket.end('BYE\n')
}

// replies Pong!
const ping = (...params) => {
  const socket = params[1]
  const reply = 'Pong!'
  h.serverReply(socket, reply)
}

// lists everyone connected to this server
const people = (...params) => {
  let reply = []
  for (const s of params[0]) {
    reply.push(s.nickname)
  }
  h.serverReply(params[1], reply.join('\n* '))
}

// remember to update this function when new command is created
const commands = (...params) => {
  let reply = [
    '/quit   -> Quits the telnet session.',
    '/ping   -> Replies "Pong!"',
    '/people -> Lists everyone who is connected to this server.',
    '/rooms  -> Lists all open chatrooms.',
    '/create -> Creates a new chatroom.',
    '/join   -> Joins an existing chatroom.',
    '/remove -> Deletes the chatroom that you own.'
  ]
  h.serverReply(params[1], reply.join('\n* '))
}

// create new chatroom
const create = (...params) => {
  let chatrooms = params[3]
  const msg = params[2]
  const socket = params[1]

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
    h.serverReply(socket, reply.join('\n* '))
    return
  }

  // create new chatroom
  const newName = chatName.join('_')
  let newChat = {
    // name: chatName.join('_'),
    creator: socket.nickname,
    users: []
  }
  chatrooms.set(newName, newChat)
  // what chatroom the socket owns
  socket.own = newName
  h.serverReply(socket, `New chatroom "${newName}" created.`)
}

// lists all existing chatrooms
const rooms = (...params) => {
  let reply = []
  const chatrooms = params[3]
  for (const [name, data] of chatrooms.entries()) {
    console.log(name, data)
    reply.push(`${name} (${data.users.length})`)
  }
  reply.push('end of list.')
  h.serverReply(params[1], reply.join('\n* '))
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
      const currentChat = chatrooms.get(socket.current)
      // remove user from their old chatroom
      currentChat.users.splice(currentChat.users.indexOf(socket.nickname), 1)
      h.serverReply(socket, `Leaving ${socket.current}...`)
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
        h.serverReply(h.getSocketByName(allSockets, user), `${socket.nickname} has joined.`)
      }
    }
  } else {
    // no chatroom with given name found
    h.serverReply(socket, `The chatroom "${name}" was not found. Please check again.`)
  }
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
        if (r === s.nickname &&  s.nickname !== socket.nickname) {
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
  quit: quit,
  ping: ping,
  people: people,
  commands: commands,
  create: create,
  rooms: rooms,
  join: join,
  remove: remove
}
