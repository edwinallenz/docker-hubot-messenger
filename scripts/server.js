module.exports = function(robot) {

    robot.router.get("/", function(req, res) {
        console.log(req.params, req.body, req.body.payload);
        res.send(req.params.hub.challenge)
    })

    robot.router.post("/", function(req, res) {
        console.log(req.params, req.body, req.body.payload);
        res.send(req.params.hub.challenge)
    })

    robot.hear(/hola/i, function(res) {
        res.reply("hola!")

    })

}
