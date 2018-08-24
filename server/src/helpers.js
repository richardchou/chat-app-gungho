
// formatted server reply with automatic new line
const serverReply = (socket, message) => {
  socket.write(`* ${message}\n`)
}

module.exports = {
  serverReply: serverReply
}
