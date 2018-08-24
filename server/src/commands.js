
const quit = (allSockets, socket, msg) => {
  socket.end('BYE\n')
}

const ping = (allSockets, socket, msg) => {
  const reply = 'Pong!\n'
  socket.write(reply)
}

const people = (allSockets, socket, msg) => {
  let reply = ''
  for (const s of allSockets.keys()) {
    reply += s + '\n'
  }
  socket.write(reply)
}

module.exports = {
  quit: quit,
  ping: ping,
  people: people
}
