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
  for (const s of params[0].keys()) {
    reply.push(s)
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
    '/join   -> Joins an existing chatroom.'
  ]
  h.serverReply(params[1], reply.join('\n* '))
}

// create new chatroom
const create = (...params) => {
  let chatrooms = params[3]
  const msg = params[2]
  const socket = params[1]
  const allSockets = params[0]

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
      'To delete it, the command is /delete'
    ]
    h.serverReply(socket, reply.join('\n* '))
    return
  }

  // create new chatroom
  let newChat = {
    name: chatName.join('_'),
    creator: h.getKeyByValue(allSockets, socket),
    users: []
  }
  chatrooms.push(newChat)
  socket.own = newChat.name
  h.serverReply(socket, `New chatroom "${newChat.name}" created.`)
}

// lists all existing chatrooms
const rooms = (...params) => {
  let reply = []
  const chatrooms = params[3]
  for (const c of chatrooms) {
    reply.push(`${c.name} (${c.users.length})`)
  }
  reply.push('end of list.')
  h.serverReply(params[1], reply.join('\n* '))
}

// join an existing chatroom
const join = (...params) => {
  let chatrooms = params[3]
  const msg = params[2]
  const socket = params[1]
  const [, ...chatName] = msg

  // no chatroom entered
  if (chatName.length === 0) {
    h.serverReply(socket, 'Please enter the chatroom you would like to join. For a list of chatrooms, the command is /rooms.')
  }

  // check if chatroom exists, if so, add this user to it.
  const name = chatName.join('_')
  for (const c of chatrooms) {
    if (c.name === name) {
      const userName = h.getKeyByValue(params[0], socket)
      c.users.push(userName)
      // socket.room = name
      h.serverReply(socket, `Entering room: "${c.name}"`)
      h.serverReply(socket, 'Users:')
      for (const user of c.users) {
        if (user === userName) {
          h.serverReply(socket, `${userName} (you)`)
        } else {
          h.serverReply(socket, `${user}`)
        }
      }
      return
    }
  }

  // no chatroom with given name found
  h.serverReply(params[1], `The chatroom "${name}" was not found. Please check again.`)
}

module.exports = {
  quit: quit,
  ping: ping,
  people: people,
  commands: commands,
  create: create,
  rooms: rooms,
  join: join
}
