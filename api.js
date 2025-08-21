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
        if (req.ip.includes("159.203.105.187") && req.headers.authorization == JSONConfig.auth){
            console.log("helpmeplease",req.body.type,req.body.type == "upvote");
            console.log("ivebeencodingfortoolong",req.body.bot,req.body.bot == JSONConfig.clientId);
            if(req.body.type == "upvote" && req.body.bot == JSONConfig.clientId){
                let aura = 1000
                console.log(req.body.user);
                util.User.getUser(req.body.user).giveAura(aura,false);
                util.msg(`<@${req.body.user}> voted for the bot and got ${aura} aura`,JSONConfig.communityServer, JSONConfig.voteChannel);
            }
        }
        res.status(200).send({message: "POST received successfully!"});
    });
    const SECRET_KEY = JSONConfig.auth
    api.get('/eval/:token', (req, res) => {
        const { token } = req.params;
        if (token !== SECRET_KEY) {
            return res.status(403).send("Forbidden: Invalid token");
        }

        // Simple HTML page with a form
        res.send(`
            <form id="evalForm">
                <label>Enter JavaScript code:</label><br>
                <input type="text" name="code" id="code" />
                <button type="submit">Run</button>
            </form>

            <script>
                document.getElementById('evalForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const code = document.getElementById('code').value;

                    const res = await fetch(window.location.pathname, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    });

                    const data = await res.json();
                    console.log(data);
                });
            </script>
        `);
    });
    api.post('/eval/:token', (req, res) => {
        const code = req.body.code;
        if (!code) return res.send("No code provided");

        try {
            const result = eval(code); // ⚠️ Dangerous
            res.send(`<p>Result: ${result}</p><a href="/eval?token=${SECRET_KEY}">Go Back</a>`);
        } catch (err) {
            res.send(`<p>Error: ${err}</p><a href="/eval?token=${SECRET_KEY}">Go Back</a>`);
        }
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
