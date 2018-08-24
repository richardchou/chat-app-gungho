const h = require('./helpers')

// terminate telnet session
const quit = (allSockets, socket, msg) => {
  socket.end('BYE\n')
}

// replies Pong!
const ping = (allSockets, socket, msg) => {
  const reply = 'Pong!'
  h.serverReply(socket, reply)
}

// lists everyone connected to this server
const people = (allSockets, socket, msg) => {
  let reply = ''
  for (const s of allSockets.keys()) {
    reply += s + '\n'
  }
  socket.write(reply)
}

// remember to update this function when new command is created
const commands = (allSockets, socket, msg) => {
  let reply = [
    '/quit -> Quits the telnet session.',
    '/ping -> Replies "Pong!"',
    '/people -> Lists everyone who is connected to this server.'
  ]
  for (const r of reply) {
    h.serverReply(socket, r)
  }
}

module.exports = {
  quit: quit,
  ping: ping,
  people: people,
  commands: commands
}
