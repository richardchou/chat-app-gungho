
// formatted server reply with automatic new line
const serverReply = (socket, message) => {
  socket.write(`* ${message}\n`)
}

const getKeyByValue = (map, value) => {
  for (const m of map.entries()) {
    if (m[1] === value) {
      return m[0]
    }
  }
}
module.exports = {
  serverReply: serverReply,
  getKeyByValue: getKeyByValue
}
