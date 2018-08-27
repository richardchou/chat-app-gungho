const h = require('./helpers')

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

const rollDice = () => {
  return getRandomInt(6)
}

const flipCoin = () => {
  return getRandomInt(2) === 0 ? 'Heads' : 'Tails'
}

// minigames can only be used in chatrooms

// flip coin then print result
const flip = (...params) => {
  const [allSockets, socket, , chatrooms] = params
  if (socket.current) {
    const currentChat = socket.current
    const coin = flipCoin()
    const room = chatrooms.get(currentChat)
    for (const user of room.users) {
      h.gameReply(h.getSocketByName(allSockets, user), `${coin}!`)
    }
  } else {
    h.serverReply(socket, 'Minigames can only be done in chatrooms.')
  }
}

const dice = (...params) => {
  const [allSockets, socket, , chatrooms] = params
  if (socket.current) {
    const currentChat = socket.current
    const dice = rollDice() + 1
    const room = chatrooms.get(currentChat)
    for (const user of room.users) {
      h.gameReply(h.getSocketByName(allSockets, user), `${socket.nickname} has rolled a ${dice}!`)
    }
  } else {
    h.serverReply(socket, 'Minigames can only be done in chatrooms.')
  }
}

module.exports = {
  flip: flip,
  dice: dice
}
