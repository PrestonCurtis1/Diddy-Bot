const util = require("./utilities.js");
const JSONConfig = require("./config.json")
const express = require("express");
const path = require("path");
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField} = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        
    ]
});
async function runApi() {
    const api = express();
    const port = 80;

    // Set up the API to serve the monaco editor
    api.use("/monaco", express.static(path.dirname(require.resolve('monaco-editor/package.json'))));

    // Set the API to parse json
    api.use(express.json());

    // Get Aura route
    api.get("/getaura/:userid", async (req, res) => {
        await util.msg(`[API] /getaura/${req.params.userid}`, JSONConfig.communityServer, JSONConfig.apiChannel)
        console.log(req.ip);github.comhu
        let aura = Math.floor((await util.User.getUser(req.params.userid))?.aura ?? 0);
        res.send({aura});
    });
    // Get Coins route
    api.get("/getcoins/:guildid/:userid", async (req, res) => {
        await util.msg(`[API] /getcoins/${req.params.guildid}/${req.params.userid}`, JSONConfig.communityServer, JSONConfig.apiChannel)
        console.log(req.ip);
        let coins = (await util.User.getUser(req.params.userid))?.getCoins(util.Guild.getGuild(req.params.guildid)) ?? 0;
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
                (await util.User.getUser(req.body.user)).giveAura(aura,false);
                util.msg(`<@${req.body.user}> voted for the bot and got ${aura} aura`,JSONConfig.communityServer, JSONConfig.voteChannel);
            }
        }
        res.status(200).send({message: "POST received successfully!"});
    });
    const SECRET_KEY = JSONConfig.auth
    api.use(express.json()); // make sure you have this

    function objectToApi(obj) {
        let api = "";
        for (var key in obj) {
            if (typeof obj[key] == "function") {
                let fnStr = obj[key].toString();
                if (fnStr.startsWith("class")) {
                    api += `\nexport ${fnStr}`
                } else {
                    /** @type {string} */
                    let fnStr = obj[key].toString();
                    fnStr = fnStr.substring(0, fnStr.indexOf("{"));
                    if (fnStr.startsWith("function") || fnStr.startsWith("async function")) {
                        api += `\nexport ${fnStr};`
                    } else {
                        api += `\n${fnStr};`;
                    }
                }
            } else if (typeof obj[key] == "object" || typeof obj[key] == "undefined") {
                api += `\nexport var ${key}: any;`;
            } else {
                api += `\nexport var ${key}: ${typeof obj[key]};`;
            }
        }
        return api;
    }

    // GET route: show input box
    api.get('/eval/:token', async (req, res) => {
        const { token } = req.params;
        if (token !== SECRET_KEY) return res.status(403).send("Forbidden: Invalid token");

        let cookies = req.header("cookie");

        if (req.query.code) {
            let codeWorked = true;
            // User just logged in with discord
            const tokenResponse = await fetch("https://discord.com/api/" + Routes.oauth2TokenExchange(), {body: `grant_type=authorization_code&code=${req.query.code}&redirect_uri=http%3A%2F%2F${JSONConfig.devpanelredirecturl}`, method: "POST", headers:{'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(JSONConfig.clientId + ":" + JSONConfig.clientSecret)}});
            if (tokenResponse.status > 400) {
                console.error("Error obtaining token: " + await tokenResponse.text() + " (" + tokenResponse.status + ")");
                codeWorked = false;
            }
            if (codeWorked) {
                const resText = await tokenResponse.text();
                const resJson = JSON.parse(resText);
                if (resJson.error) {
                    console.error("Error obtaining token: " + resText + " (" + tokenResponse.status + ")");
                    codeWorked = false;
                }
                if (codeWorked) {
                    res.set('Set-Cookie', `auth=${resJson.access_token}; Max-Age=${resJson.expires_in}`);
                    cookies = `auth=${resJson.access_token}`;
                }
            }
        }

        let username;
        let pfp;

        if (cookies) {
            for (var cookie of cookies.split(";")) {
                cookie = cookie.trim().split("=");
                const name = cookie[0].trim();
                const value = cookie[1].trim();
                if (name.toLowerCase() == "auth") {
                    const userRes = await fetch('https://discord.com/api/users/@me', {headers: {'Authorization': `Bearer ${value}`}});
                    if (userRes.status > 400) {
                        util.msg("Could not fetch logged in user to dev panel: " + await userRes.text() + " (" + userRes.status + ")");
                        res.status(302).set('Location', `https://discord.com/oauth2/authorize?client_id=${JSONConfig.clientId}&response_type=code&redirect_uri=http%3A%2F%2F${JSONConfig.devpanelredirecturl}&scope=identify`).end();
                        return;
                    }
                    const userResText = await userRes.text();
                    const userResJson = JSON.parse(userResText);
                    if (userResJson.error) {
                        util.msg("Could not fetch logged in user to dev panel: " + userResText + " (" + userRes.status + ")");
                        res.status(302).set('Location', `https://discord.com/oauth2/authorize?client_id=${JSONConfig.clientId}&response_type=code&redirect_uri=http%3A%2F%2F${JSONConfig.devpanelredirecturl}&scope=identify`).end();
                        return;
                    }
                    if (!await util.isDev(userResJson.id)) {
                        res.status(403).send(`
                            <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Diddy Bot Dev Panel - Unauthorized</title>
                                </head>
                                <body>
                                    <h1>Cannot access dev panel</h1>
                                    <p>You must be a developer in the Diddy Bot community server to access the dev panel</p>
                                    <button onclick="relog();">Login with a new account</button>
                                    <script>
                                        function relog() {
                                            document.cookie = 'auth=0; Max-Age=-1';
                                            location.reload();
                                        }
                                    </script>
                                </body>
                            </html>
                            `)
                        return;
                    }
                    username = userResJson.global_name;
                    pfp = userResJson.id + "/" + userResJson.avatar;
                }
            }
        } else {
            res.status(302).set('Location', `https://discord.com/oauth2/authorize?client_id=${JSONConfig.clientId}&response_type=code&redirect_uri=http%3A%2F%2F${JSONConfig.devpanelredirecturl}&scope=identify`).end();
            return;
        }

        const jsonKeys = Object.keys(JSONConfig);
        const declareJSONConfig = `declare const JSONConfig: {${jsonKeys.join(": string,") + ": string"}}`;

        const utilApi = `${declareJSONConfig}\ndeclare namespace util {${objectToApi(util).replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${')}\n}`;
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <script src="../monaco/min/vs/loader.js"></script>
                <style>
                    button {
                        width: 10%;
                        height: 5%;
                        background: none;
                        border: 5px solid aquamarine;
                        border-radius: 10px;
                        transition: background 0.5s;
                        box-sizing: content-box;
                    }
                    button:hover {
                        background: #f3f3f3ff;
                    }
                    body {
                        height: 100vh;
                        display: flex; 
                        overflow-x: clip;
                    }
                    input.prettyprint {
                        position: relative;
                        left: 10px;
                    }
                    input.prettyprint::before {
                        position: relative;
                        left: 20px;
                        content: "Pretty Print";
                        white-space: nowrap;
                    }
                </style>
            </head>
            <body>
                <div id="code" style="height: 100%; width: 70vw;"></div>
                <div style="border-right: 1px solid gray; margin-left: 10px; margin-right: 20px;"></div>
                <div style="align-items: center; display: flex; flex-direction: column; width: 100%;">
                    <div style="display:flex;">
                        <h1 style="position: relative; left:70px;">Diddy Bot Developer Panel</h1>
                        <img src="https://cdn.discordapp.com/avatars/${pfp}?size=512" style="width: 50px; height:50px; margin-left:100px; clip-path: circle(50% at 50% 50%)"/>
                        <span>${username} <a style="color: red;" href="#" onclick="logout();">Log Out</a><span>
                    </div>
                    <button id="run">Run Code</button>
                    <div style="position: relative;top: 50%; width: 100%; left: 30px;">
                        <h2 style="width:100%;border: 2px solid gray;border-radius: 10px;padding: 3px; margin-bottom:0;">
                            Output
                            <input type="checkbox" class="prettyprint"/>
                        </h2>
                        <pre id="output" style="height:50vh; background-color: black; color: lime; margin: 1px; overflow: scroll; width: calc(100% - 20px); position: absolute; right: 20px;"></pre>
                    </div>
                </div>

                <script>
                    function logout() {
                        document.cookie = 'auth=0; Max-Age=-1';
                        location.reload();
                    }
                    document.addEventListener('DOMContentLoaded', () => {
                        require.config({ paths: { vs: '../monaco/min/vs' } });
			            require(['vs/editor/editor.main'], function () {
                            monaco.languages.typescript.javascriptDefaults.addExtraLib(\`${utilApi}\`, "file:///utilities.d.ts");
                            const editor = monaco.editor.create(document.getElementById('code'), {language: 'javascript'});
                            const button = document.getElementById('run');
                            const input = document.getElementById('code');
                            const output = document.getElementById('output');

                            button.addEventListener('click', async () => {
                                const code = editor.getValue();
                                try {
                                    const res = await fetch(window.location.pathname, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ code })
                                    });

                                    const data = await res.json(); // <-- now POST returns JSON
                                    const result = typeof data.result == "object" ? JSON.stringify(data.result, null, document.querySelector(".prettyprint").checked ? ' ' : null) : data.result;
                                    output.textContent = result ?? data.error;
                                } catch (err) {
                                    output.textContent = "Fetch error: " + err;
                                }
                            });
                        });
                    });
                </script>
            </body>
            </html>
        `);
    });

    // POST route: evaluate code
    api.post('/eval/:token', async (req, res) => {
        const { token } = req.params;
        if (token !== SECRET_KEY) return res.status(403).json({ error: "Forbidden: Invalid token" });

        // Check if the user is logged in
        let cookies = req.header("cookie");
        if (cookies) {
            for (var cookie of cookies.split(";")) {
                cookie = cookie.trim().split("=");
                const name = cookie[0].trim();
                const value = cookie[1].trim();
                if (name.toLowerCase() == "auth") {
                    const userRes = await fetch('https://discord.com/api/users/@me', {headers: {'Authorization': `Bearer ${value}`}});
                    if (userRes.status > 400) {
                        util.msg("Could not fetch logged in user to dev panel: " + await userRes.text() + " (" + userRes.status + ")");
                    }
                    const userResJson = JSON.parse(await userRes.text());
                    if (userResJson.error) {
                        util.msg("Could not fetch logged in user to dev panel: " + await userRes.text() + " (" + userRes.status + ")");
                    }
                    if (!await util.isDev(userResJson.id)) {
                        return res.status(403).json({ error: "Forbidden: Not a developer" });
                    }
                }
            }
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const code = req.body?.code;
        if (!code) return res.json({ error: "No code provided" });

        try {
            const result = await eval(code); // ⚠️ Dangerous
            res.json({ result }); // <-- must send JSON
        } catch (err) {
            res.json({ error: err.toString() });
        }
    });
    // Get Mangoes route
    api.get("/getmangoes/:userid", async (req, res) => {
        await util.msg(`[API] /getmangoes/${req.params.userid}`, JSONConfig.communityServer, JSONConfig.apiChannel)
        console.log(req.ip);
        let mangoes = Math.floor((await util.User.getUser(req.params.userid))?.getMangoes() ?? 0);
        res.send({mangoes});
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
