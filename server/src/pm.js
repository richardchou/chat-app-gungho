const h = require('./helpers')

// private messages
const pm = (...params) => {
  const [allSockets, socket, msg] = params
  const [, ...message] = msg

  // check for correct parameters
  if (message.length === 0) {
    h.serverReply(socket, 'Please specify who you would like to send a private message to. ex. /pm jason hello')
  } else if (message.length === 1) {
    h.serverReply(socket, 'You may not send an empty private message.')
  } else {
    const [sendTo, ...sendMsg] = message
    // no pming themselves
    if (sendTo === socket.nickname) {
      h.serverReply(socket, 'You cannot send a private message to yourself.')
      return
    }
    // check if user exists, if so, send pm to user
    const sendSocket = h.getSocketByName(allSockets, sendTo)
    if (sendSocket) {
      sendSocket.lastPM = socket.nickname
      h.pmReply(sendSocket, socket.nickname, sendMsg.join(' '))
    } else {
      h.serverReply(socket, 'The person you are trying to reach does not exist or has left the server.')
    }
  }
}

// reply to person who last sent you a pm
const reply = (...params) => {
  const [allSockets, socket, msg] = params
  const [, ...message] = msg

  if (message.length === 0) {
    h.serverReply(socket, 'You may not send an empty private message.')
  } else if (!socket.lastPM) {
    h.serverReply(socket, 'You have not received any PMs yet.')
  } else {
    const sendSocket = h.getSocketByName(allSockets, socket.lastPM)

    // check if person to reply is still in server
    if (!sendSocket) {
      h.serverReply(socket, 'The person you are trying to reach has logged out or disconnected from the server.')
    } else {
      sendSocket.lastPM = socket.nickname
      h.pmReply(sendSocket, socket.nickname, message.join(' '))
    }
  }
}

module.exports = {
  pm: pm,
  reply: reply
}
