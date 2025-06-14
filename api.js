const util = require("./utilities.js");
const JSONConfig = require("./config.json")
const express = require("express");

async function runApi() {
    const api = express();
    const port = 80;

    // Set the API to parse json
    api.use(express.json());

    // Get Aura route
    api.get("/getaura/:userid", async (req, res) => {
        await util.msg(`[API] /getaura/${req.params.userid}`, JSONConfig.communityServer, JSONConfig.apiChannel)
        console.log(req.ip);
        let aura = Math.floor(util.User.getUser(req.params.userid)?.aura ?? 0);
        res.send({aura});
    });
    // Get Coins route
    api.get("/getcoins/:guildid/:userid", async (req, res) => {
        await util.msg(`[API] /getcoins/${req.params.guildid}/${req.params.userid}`, JSONConfig.communityServer, JSONConfig.apiChannel)
        console.log(req.ip);
        let coins = util.User.getUser(req.params.userid)?.getCoins(util.Guild.getGuild(req.params.guildid)) ?? 0;
        res.send({coins});
    });
    // rizzme messages route
    api.get("/pickuplines", async (req, res) => {
        await util.msg(`[API] /pickuplines`, JSONConfig.communityServer, JSONConfig.apiChannel);
        console.log(req.ip);
        let pickuplines = util.getPickupLines();
        res.send(pickuplines);
    });
    // random rizzme route
    api.get("/rizzme", async (req, res) => {
        await util.msg(`[API] /rizzme`, JSONConfig.communityServer, JSONConfig.apiChannel);
        console.log(req.ip);
        let pickuplines = util.getPickupLines();
        const pickupline = pickuplines[Math.floor(Math.random() * pickuplines.length)];
        res.send({pickupline});
    });
    api.get("/help", async (req, res) => {
        await util.msg(`[API] /help`, JSONConfig.communityServer, JSONConfig.apiChannel);
        console.log(req.ip);
        res.send("/getaura\n/getcoins\n/pickuplines\n/rizzme\n/help");
    });
    api.post("/vote", async (req, res) => {
        const data = await req.body;
        console.log(`Recieved post data: ${data}`);
        res.status(200).send({ message: 'POST received successfully!' });
    });
    // Listen for requests
    api.listen(port, (e) => {
        if (e) {
            console.error("An error occured while trying to listen for API requests",e);
        } else {
            console.log("Diddy Bot API started!");
        }
    });
}

module.exports = {
    runApi,
}
