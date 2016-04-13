module.exports = (robot) ->
  robot.respond /greet/i, (msg) ->
    console.log msg.envelope
    console.log msg.message.id
    msg.send "Hello, World!"
