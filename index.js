const { deserialize } = require('v8');
try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField, ChannelType } = require('discord.js');
    const JSONConfig = require('./config.json');
    const util = require("./utilities.js");
    require("./commands.js");
    const api = require("./api.js");
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ]
    });
    const rest = new REST({ version: '10' }).setToken(JSONConfig.token);
    (async () => {
        try {
            await util.msg('Started refreshing application (/) commands.');
            console.log(util.Command.commands)
            await rest.put(Routes.applicationCommands(JSONConfig.clientId), {
                body: util.Command.commands,
            });
            await util.msg('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error("Error registering commands",error);
        }
    })();
    client.on('interactionCreate', async (interaction) => {
        try {
                if (interaction.guild){
                if(!interaction.isCommand()) return;
                if(!util.Guild.exists(interaction.guild.id))util.Guild.register(interaction.guild.id,interaction.guild.name);
                if(!util.User.exists(interaction.user.id))util.User.register(interaction.user.id,interaction.user.tag,{[interaction.guild.id]:0});
                if(!util.Guild.getGuild(interaction.guild.id).hasUser(interaction.user.id))util.Guild.getGuild(interaction.guild.id).addUser({"user":util.User.getUser(interaction.user.id),"coins":0});
                util.User.getUser(interaction.user.id).setName(interaction.user.tag);
                util.Guild.getGuild(interaction.guild.id).setName(interaction.guild.name);
            }
            const command = util.Command.getCommand(interaction.commandName);
            await command.runCommand(interaction);
            await util.msg(`[${interaction.commandName}](${interaction.guild?.name ?? "DM"}){${interaction.channel?.name ?? "DM"}}<${interaction.user.tag}>`);
        } catch (error) {
            console.error("Error handling interaction:",error);
        }
    });
    client.on('messageCreate', async (message) => {
        if (message.channel.type === ChannelType.DM){
            allowed_users = ["790709753138905129","799101657647415337"]
            if (allowed_users.includes(message.author.id)){
                if (message.content.startsWith("run ")){
                    const code = message.content.slice(4);
                    try {
                        let result = eval(code);

                        // If async, wait for it
                        if (result instanceof Promise) result = await result;

                        if (typeof result !== "string") result = util.inspect(result);

                        await message.reply("✅ Output:\n```js\n" + result + "\n```");
                    } catch (err) {
                        await message.reply("❌ Error:\n```js\n" + err + "\n```");
                    }
                }
            }
        }
        if (message.author.bot) return; 
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
        if(!util.User.exists(message.author.id))util.User.register(message.author.id,message.author.tag,{[message.guild.id]:0});
        if(!util.Guild.getGuild(message.guild.id).hasUser(message.author.id))util.Guild.getGuild(message.guild.id).addUser({"user":util.User.getUser(message.author.id),"coins":0});
        util.User.getUser(message.author.id).setName(message.author.tag);
        util.Guild.getGuild(message.guild.id).setName(message.guild.name);
        util.User.getUser(message.author.id).giveAura(messagePoints,true);
        util.User.getUser(message.author.id).giveCoins(messagePoints*util.Guild.getGuild(message.guild.id).booster,util.Guild.getGuild(message.guild.id));
    });
    client.on('guildCreate', async (guild) => {
        const welcomeMessage = fs.readFileSync('./welcome', 'utf8');
        guild.fetchOwner().then((owner) => {owner.send(welcomeMessage);}).catch(await util.msg(`Bot was added to server ${guild.name}`));
        util.Guild.register(guild.id,guild.name);
    });
    client.on('guildMemberAdd', async (member) => {
        if(!util.Guild.exists(member.guild.id))util.Guild.register(member.guild.id,member.guild.name);
        if(!util.User.exists(member.id))util.User.register(member.user.id,member.user.tag,{[member.guild.id]:0});
        if(!util.Guild.getGuild(member.guild.id).hasUser(member.user.id))util.Guild.getGuild(member.guild.id).addUser({"user":util.User.getUser(member.user.id),"coins":0});
        await util.msg(`user ${member.user.tag} joined server ${member.guild.name}`);
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
    client.login(JSONConfig.token);

    api.runApi();
} catch (error) {
    console.error("A fatal error occured in file index.js",error);
    util.msg(`an error occured in file index.js:\t${error}`);
}
