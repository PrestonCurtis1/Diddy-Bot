const { deserialize } = require('v8');
try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json');
    const util = require("./utilities.js");
    require("./commands.js");
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ]
    });
    const rest = new REST({ version: '10' }).setToken(JSONConfig.token);
    (async () => {
        try {
            await util.msg('Started refreshing application (/) commands.');
            //console.log(util.Command.commands)
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
                util.User.getUser(interaction.user.id).name = interaction.user.tag;
                util.Guild.getGuild(interaction.guild.id).name = interaction.guild.name;
                util.migrate(interaction.user.id);
            }
            const command = util.Command.getCommand(interaction.commandName);
            command.runCommand(interaction);
            await util.msg(`[${interaction.commandName}](${interaction.guild?.name ?? "DM"}){${interaction.channel?.name ?? "DM"}}<${interaction.user.tag}>`);
        } catch (error) {
            console.error("Error handling interaction:",error);
        }
    });
    client.on('messageCreate', (message) => {
        if (message.author.bot) return; 
        const messagePoints = Math.floor(25 + (message.content.length / 20) + (30 * (message.attachments.size + message.embeds.length)));
        if(!util.Guild.exists(message.guild.id))util.Guild.register(message.guild.id,message.guild.name);
        if(!util.User.exists(message.author.id))util.User.register(message.author.id,message.author.tag,{[message.guild.id]:0});
        if(!util.Guild.getGuild(message.guild.id).hasUser(message.author.id))util.Guild.getGuild(message.guild.id).addUser({"user":util.User.getUser(message.author.id),"coins":0});
        util.User.getUser(message.author.id).name = message.author.tag;
        util.Guild.getGuild(message.guild.id).name = message.guild.name;
        util.migrate(message.author.id);
        util.User.getUser(message.author.id).giveAura(messagePoints,true);
        util.User.getUser(message.author.id).giveCoins(messagePoints,util.Guild.getGuild(message.guild.id));
        console.log(util.User.getUser(message.author.id).getCoins(util.Guild.getGuild(message.guild.id)));
        util.saveData();
    });
    client.on('guildCreate', async (guild) => {
        guild.fetchOwner().then((owner) => {owner.send(`Thanks for adding me to your server, ${guild.name}!`);}).catch(await util.msg(`Bot was added to server ${guild.name}`));
        new util.Guild.register(guild.id,guild.name);
    });
    client.on('guildMemberAdd', async (member) => {
        if(!util.Guild.exists(member.guild.id))util.Guild.register(member.guild.id,member.guild.name);
        if(!util.User.exists(member.id))util.User.register(member.user.id,member.user.id,{[member.guild.id]:0});
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
    setInterval(async () => {
        await util.restartBot();
    },5*1000);//every 5 seconds check if memory usage is above 80% then restart the bot if so
    client.login(JSONConfig.token);
} catch (error) {
    console.error("A fatal error occured in file index.js",error);
}