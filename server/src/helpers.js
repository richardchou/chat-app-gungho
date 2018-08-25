
// formatted server reply with automatic new line
const serverReply = (socket, message) => {
  socket.write(`* ${message}\n`)
}

const getSocketByName = (sockets, name) => {
  for (const s of sockets) {
    if (name === s.nickname) {
      return s
    }
  }
}
// const getKeyByValue = (map, value) => {
//   for (const m of map.entries()) {
//     if (m[1] === value) {
//       return m[0]
//     }
//   }
// }
module.exports = {
  serverReply: serverReply,
  getSocketByName: getSocketByName
}
