const util = require("./utilities.js");
const express = require("express");

async function runApi() {
    const api = express();
    const port = 80;

    // Set the API to parse json
    api.use(express.json());

    // Get Aura route
    api.get("/getaura/:userid", async (req, res) => {
        await util.msg(`[API] /getaura/${req.params.userid}`)
        let aura = Math.floor(util.User.getUser(req.params.userid)?.aura ?? 0);
        res.send({aura});
    });
    api.get("/getcoins/:guildid/:userid", async (req, res) => {
        await util.msg(`[API] /getaura/${req.params.userid}`)
        let coins = util.User.getUser(req.params.userid)?.getCoins(req.params.guildid) ?? 0;
        res.send({coins});
    });
    // Listen for requests
    api.listen(port, (e) => {
        if (e) {
            console.error("An error occured while trying to listen for API requests");
        } else {
            console.log("Diddy Bot API started!");
        }
    });
}

module.exports = {
    runApi,
}