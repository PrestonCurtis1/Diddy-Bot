const util = require("./utilities.js");
const express = require("express");

async function runApi() {
    const api = express();
    const port = 80;

    // Set the API to parse json
    api.use(express.json());

    // Get Aura route
    api.get("/getaura/:userid", async (req, res) => {
        await util.msg(`[API] /getaura/${req.params.userid}`, "1310772622044168275", "1373122799362641971")
        let aura = Math.floor(util.User.getUser(req.params.userid)?.aura ?? 0);
        res.send({aura});
    });
    // Get Coins route
    api.get("/getcoins/:guildid/:userid", async (req, res) => {
        await util.msg(`[API] /getcoins/${req.params.guildid}/${req.params.userid}`, "1310772622044168275", "1373122799362641971")
        let coins = util.User.getUser(req.params.userid)?.getCoins(util.Guild.getGuild(req.params.guildid)) ?? 0;
        res.send({coins});
    });
    // rizzme messages route
    api.get("/pickuplines", async (req, res) => {
        await util.msg(`[API] /pickuplines`, "1310772622044168275", "1373122799362641971");
        let pickuplines = util.getPickupLines();
        res.send(pickuplines);
    });
    // random rizzme route
    api.get("/rizzme", async (req, res) => {
        await util.msg(`[API] /rizzme`, "1310772622044168275", "1373122799362641971");
        let pickuplines = util.getPickupLines();
        const pickupline = pickuplines[Math.floor(Math.random() * pickuplines.length)];
        res.send({pickupline});
    });
    api.get("/help",async (req, res) => {
        await util.msg(`[API] /help`, "1310772622044168275", "1373122799362641971");
        res.send("/getaura\n/getcoins\n/pickuplines\n/rizzme\n/help");
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