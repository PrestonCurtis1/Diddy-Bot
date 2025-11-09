const { deserialize } = require('v8');
try {
    const fs = require('fs');
    // const { setGlobalDispatcher, Agent } = require("undici");
    // cognst agent = new Agent({
    //     connect: { timeout: 10_000 } // 10s timeout
    // });
    // setGlobalDispatcher(agent);

    // agent.on("connectError", (err) => {
    //     console.log("Logging ConnectError",err?.code,err?.name)
    //     if (err?.code === "UND_ERR_CONNECT_TIMEOUT" || err?.name === "ConnectTimeoutError") {
    //         console.error("Global undici connect timeout detected, exiting...");
    //         process.exit(1);//im just exitting so pm2 can restart it once i setup pm2
    //     }
    // });//im restorting to using chatgpt to fix this error, and chatgpt said to put the code here but idk if it knows what its doing tbh lol
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField} = require('discord.js');
    // const https = require("https");
    const JSONConfig = require('./config.json');
    const util = require("./utilities.js");
    const commands = require("./commands.js");
    const api = require("./api.js");
    const logdms = require("./logdms.js");
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
           
        ]
    });
    
    const rest = new REST({ version: '10', timeout: 60000}).setToken(JSONConfig.token);
    (async () => {
        try {
            await util.msg('Started refreshing application (/) commands.');
            await rest.put(Routes.applicationCommands(JSONConfig.clientId), {
                body: util.Command.commands,
            });
            await util.msg('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error("Error registering commands",error);
        }
    })();
    client.on('interactionCreate', async (interaction) => {
        if (util.isLoadingData())return;
        try {
                if (interaction.guild){
                if(!interaction.isCommand() && !interaction.isMessageComponent()) return;
                if(!util.Guild.exists(interaction.guild.id))util.Guild.register(interaction.guild.id,interaction.guild.name);
                if(!(await util.User.exists(interaction.user.id)))util.User.register(interaction.user.id,interaction.user.tag,{[interaction.guild.id]:0});
                if(!util.Guild.getGuild(interaction.guild.id).hasUser(interaction.user.id))await util.Guild.getGuild(interaction.guild.id).addUser(interaction.user.id);
                (await util.User.getUser(interaction.user.id)).setName(interaction.user.tag);
                util.Guild.getGuild(interaction.guild.id).setName(interaction.guild.name);
            }
            if (interaction.isCommand()) {
                await interaction.deferReply();
                const command = util.Command.getCommand(interaction.commandName);
                await command.runCommand(interaction);
                await util.msg(`[${interaction.commandName}](${interaction.guild?.name ?? "DM"}){${interaction.channel?.name ?? "DM"}}<${interaction.user.tag}>`);
            } else if (interaction.isMessageComponent()) {
                for (var command of util.ComponentCommand.commands) {
                    if (interaction.customId.startsWith(command.prefix)){
                        if (command.defer)await interaction.deferUpdate();
                        command.run(interaction);
                    }
                }
                await util.msg(`[${interaction.customId} (message component)](${interaction.guild?.name ?? "DM"}){${interaction.channel?.name ?? "DM"}}<${interaction.user.tag}>`);
            }
        } catch (error) {
            console.error("Error handling interaction:",error);
        }
    });
    client.on('messageCreate', async (message) => {
        if(util.isLoadingData())return;
        if (message.author.bot) return;
        if (!message.guild) return;
        const messagePoints = Math.floor(Math.random() * (50 - 15 + 1) + 15);
        let msgcontent = "none";
        if(message.content != undefined){
            msgcontent = message.content;
        }
		if (message.mentions.has(client.user) && msgcontent != "none" && msgcontent.includes("<@1305713838775210015>")) {
            content = `User:\t${message.author.username}\nServer:\t${message.guild.name}\nchannel:\t${message.channel.name}\nmessage:\t${msgcontent}`;
            util.msg(content,JSONConfig.communityServer,JSONConfig.mentionsChannel);
            message.reply("Ping sent to diddy bot discord");
        }
        if(!util.Guild.exists(message.guild.id))util.Guild.register(message.guild.id,message.guild.name);
        if(!(await util.User.exists(message.author.id)))util.User.register(message.author.id,message.author.tag,{[message.guild.id]:0});
        let guild = util.Guild.getGuild(message.guild.id);
	    if(!guild)return;
        if(!guild.hasUser(message.author.id))await guild.addUser(message.author.id);
        (await util.User.getUser(message.author.id))?.setName(message.author.tag);
        guild.setName(message.guild.name);
        (await util.User.getUser(message.author.id)).giveAura(messagePoints,true);
        (await util.User.getUser(message.author.id)).giveCoins(messagePoints*util.Guild.getGuild(message.guild.id).booster,util.Guild.getGuild(message.guild.id));
    });
    client.on('guildCreate', async (guild) => {
        const welcomeMessage = fs.readFileSync('./welcome', 'utf8');
        guild.fetchOwner().then((owner) => {owner.send(welcomeMessage);}).catch(await util.msg(`Bot was added to server ${guild.name}`));
        util.Guild.register(guild.id,guild.name);
    });
    client.on('guildMemberAdd', async (member) => {
        if(!util.Guild.exists(member.guild.id))util.Guild.register(member.guild.id,member.guild.name);
        if(!(await util.User.exists(member.id)))util.User.register(member.user.id,member.user.tag,{[member.guild.id]:0});
        if(!util.Guild.getGuild(member.guild.id).hasUser(member.user.id))await util.Guild.getGuild(member.guild.id).addUser(member.user.id);
        await util.msg(`user ${member.user.tag} joined server ${member.guild.name}`);
    });
    client.on("error", error => {
        console.error("An error occured with the bot", error);
    });
    client.on("shardError", error => {
        console.error("WebSocket error:", error);
        process.exit(1);
    });

    client.once('ready', async () => {
        await util.msg(`Logged in as ${client.user.tag}! index.js`);
        const serverCount = client.guilds.cache.size;
        await util.msg(`The bot is currently in ${serverCount} server(s).`);
        client.user.setPresence({
            activities: [{ name: 'at the Diddy Party', type: 0 }],
            status: 'online', 
        });
    });
    client.login(JSONConfig.token)
    process.on("unhandledRejection", (err) => {
    if (err && err.code === "UND_ERR_CONNECT_TIMEOUT") {
        console.error("❌ Connection to Discord API timed out. Exiting...");
        process.exit(1);
    } else {
        console.error("⚠️ Unhandled rejection:", err);
    }
});

    process.on("uncaughtException", (err) => {
        console.error("Uncaught Exception thrown:", err);
        process.exit(1); 
    });
    process.on("exit",(code) => {
        console.log(`Bot has exited with code ${code}\n${Math.ceil(process.uptime()/60)} minutes`);
    });
    api.runApi();
} catch (error) {
    console.error("A fatal error occured in file index.js",error);
    util.msg(`an error occured in file index.js:\t${error}`);
}
