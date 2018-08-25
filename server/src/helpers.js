
// formatted server reply with automatic new line
const serverReply = (socket, message) => {
  socket.write(`* ${message}\n`)
}

const userReply = (socket, name, message) => {
  socket.write(`${name}: ${message}\n`)
}

const getSocketByName = (sockets, name) => {
  for (const s of sockets) {
    if (name === s.nickname) {
      return s
    }
  }
}

module.exports = {
  serverReply: serverReply,
  userReply: userReply,
  getSocketByName: getSocketByName
}
