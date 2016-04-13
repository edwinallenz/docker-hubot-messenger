var internals = {
  state: {
    step:1,
    order:null,
    attempts: 1,
    bridge: false
  }
}

module.exports = function(robot) {

  internals.start = function(res){
    res.send("Hola "+res.envelope.user.name+"! ");
    res.send("En Taco Bot tenemos Tacos y Tortas. Que quisieras ordenar hoy?");

    //set state
    robot.brain.set(res.envelope.user.id, internals.state)
    res.finish()
  }

  internals.default = function(res){
    var state = robot.brain.get(res.envelope.user.id)
    if (!state) {
      state = internals.state
    }

    if (state.attempts == 3) {
      state.bridge = true
      res.send("En un momento un agente estará contigo para resolver tus dudas.")
    } else {
      state.attempts++

      switch(state.step) {
        case 1:
          res.send("No he podido entender tu orden, que quisieras ordenar? tenemos tacos o tortas");
          break;
        case 2:
          res.send("No he podido entender, tendría un costo de 75 pesos por llevarte " + state.order);
          res.send("Necesito que me indiques si los quieres con un si o un no")
          break;
        case 3:
          res.send("No entiendo esa calificación, como te parecio mi servicio del 1 al 10?");
          break;
        case 4:
          res.send("Hola de nuevo! :)")
          res.send("Quieres tacos o tortas?")

          //set state
          robot.brain.set(res.envelope.user.id, internals.state)
          break;
        default:
          state.bridge = true
          res.send("En un momento un agente estará contigo para resolver tus dudas.")
      }
    }
  }

  internals.bridge = function(res) {
    res.send('Redireccionando al agente(WIP)...')
  }

  robot.receiveMiddleware(function(context, next, done) {
    var state = robot.brain.get(context.response.envelope.user.id)
    if (state && state.bridge) {
      internals.bridge(context.response)
      done()
    } else {
      next(done)
    console.log(context.response.envelope.user.id, state);
    }
  })

  robot.hear(/(buenas|hola|hey|que tal|buenos dias|buenas tardes|me alegro de verte|como vas|cómo vas|que onda|q onda|buenos días)/i, internals.start)
  robot.enter(internals.start);

  robot.hear(/(tacos|taco|tortas|torta)/i, function(res){
    var state = robot.brain.get(res.envelope.user.id)
    if (state && state.step == 1) {
      var order = res.match[1]
      state.order = order
      res.send("Excelente elección! " + order + " son mis favoritos. Tendría un costo de 75 pesos por llevartelos.")
      res.send("Los quieres?")
      //set state
      state.step = 2
      robot.brain.set(res.envelope.user.id, state)
      res.finish()
    } else {
      internals.default(res)
    }
  });

  robot.hear(/(ok|si|no)/i, function(res){
    var state = robot.brain.get(res.envelope.user.id)
    if (state && state.step == 2) {
      var boolean = res.match[1].toLowerCase()
      if (boolean == "si" || boolean == "ok") {
        state.step = 4
        res.send("Tu orden ha sido asignada. Para completar tu pago ingresa tus datos http://yaloquiero.mx/pago y lo enviaremos en cuanto este listo.");
        res.send("Gracias por confiar en nuestro servicio!");
      } else {
        state.step = 3
        res.send("Que triste! Siempre trato de mejorar, del 1 a 10 como te parecio mi servicio?");
      }

      //set state
      robot.brain.set(res.envelope.user.id, state)
      res.finish()
    } else {
      internals.default(res)
    }
  });

  robot.hear(/^(\d){1,2}$/i, function(res){
    var state = robot.brain.get(res.envelope.user.id)
    if (state && state.step == 3) {
      var number = parseInt(res.match[1])
      if (number > 1 && number <=10) {
        res.send("Gracias!");
      } else if (number > 10) {
        res.send("Wow! ese es un numero muy alto, lo voy a tomar como excelente, gracias!");
      } else {
        res.send("Ese es un numero muy bajo :(")
        res.send("intentare mejorar!")
      }

      //set state
      state.step = 4
      robot.brain.set(res.envelope.user.id, state)
      res.finish()
    } else {
      internals.default(res)
    }
  });

  robot.catchAll(internals.default);
}
/*module.exports = function(robot) {

	robot.router.get("/", function(req, res) {
		console.log("get", req.query);
		res.send(req.query['hub.challenge'])
	})

	robot.router.post("/", function(req, res) {
		console.log(req.body, req.body.entry[0], req.params);
		var msgs = req.body.entry[0].messaging
for (i = 0; i < msgs.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
console.log(event.sender, event.recipient, event.message, sender)
    if (event.message && event.message.text) {
      text = event.message.text;
console.log(text)
      // Handle a text message from this sender
    }
  }
  res.send("ok");
	})

	robot.hear(/hola/i, function(res) {
		res.send("hola!")
	
	})
}
*/
