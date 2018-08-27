const h = require('./helpers')
const chat = require('./chatrooms')
const pm = require('./pm')
const minigames = require('./minigames')

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
  const [allSockets, socket] = params
  for (const s of allSockets) {
    if (s.nickname === socket.nickname) {
      reply.push(socket.nickname + ' (you)')
    } else {
      reply.push(s.nickname)
    }
  }
  h.serverReply(socket, reply.join('\r\n* '))
  h.serverReply(socket, 'end of list.')
}

// remember to update this function when new command is created
const commands = (...params) => {
  let reply = [
    '========== GENERAL COMMANDS ==========',
    '/quit   -> Quits the telnet session.',
    '/ping   -> Replies "Pong!"',
    '/people -> Lists everyone who is connected to this server.',
    '========== CHATROOM COMMANDS ==========',
    '/rooms  -> Lists all open chatrooms.',
    '/create -> Creates a new chatroom.',
    '/join   -> Joins an existing chatroom.',
    '/here   -> Lists all users in current chatroom',
    '/leave  -> Leaves current chatroom.',
    '/remove -> Deletes the chatroom that you own.',
    '========== PRIVATE MESSAGE COMMANDS ==========',
    '/pm     -> Send user a private message. ex. /pm User Hello',
    '/reply  -> Send message to the person who last send you a private message.',
    '========== MINIGAMES (chatroom use only) ==========',
    '/flip   -> Flips a coin heads or tails.',
    '/dice   -> Rolls a die.'
  ]
  h.serverReply(params[1], reply.join('\r\n* '))
}

const cmds = {
  quit: quit,
  ping: ping,
  people: people,
  commands: commands
}

module.exports = {
  ...cmds,
  ...chat,
  ...pm,
  ...minigames
}
