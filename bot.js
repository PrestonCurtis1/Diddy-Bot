const { deserialize } = require('v8');
try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json');
    const util = require('./utilities.js');
    const commands = require('./commands.js');
    const logdms = require('./logdms.js');

    // Debug: print process start info to help diagnose sharding environment
    console.log(`bot.js starting. pid=${process.pid} argv=${process.argv.join(' ')} cwd=${process.cwd()}`);
    console.log('SHARDING_MANAGER:', process.env.SHARDING_MANAGER);
    console.log('SHARDING_MANAGER_MODE:', process.env.SHARDING_MANAGER_MODE);
    console.log('SHARDS env:', process.env.SHARDS);
    console.log('SHARD_COUNT env:', process.env.SHARD_COUNT);
    console.log('DISCORD_TOKEN present:', !!process.env.DISCORD_TOKEN);

    // Support being launched by ShardingManager (env vars SHARDS and SHARD_COUNT)
    const shardEnv = process.env.SHARDS; // single id or comma-separated list
    const shardCountEnv = process.env.SHARD_COUNT;
    let clientOptions = {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
        ],
    };

    if (shardEnv !== undefined && shardCountEnv !== undefined) {
        const shardList = String(shardEnv).split(',').map(s => Number(s)).filter(n => !Number.isNaN(n));
        const shardCount = Number(shardCountEnv);
        if (shardList.length > 0 && Number.isInteger(shardCount) && shardCount > 0) {
            clientOptions.shards = shardList;
            clientOptions.shardCount = shardCount;
            console.log(`Starting shard worker. shard ids: ${clientOptions.shards}, shardCount: ${clientOptions.shardCount}`);
        } else {
            console.log('Shard env detected but invalid shard list or count', { shardList, shardCountEnv });
        }
    }

    const client = new Client(clientOptions);
    console.log('Client options:', { shards: clientOptions.shards, shardCount: clientOptions.shardCount });

    client.on('interactionCreate', async (interaction) => {
        if (util.isLoadingData()) return;
        try {
            if (interaction.guild) {
                if (!interaction.isCommand() && !interaction.isMessageComponent()) return;
                if (!util.Guild.exists(interaction.guild.id)) util.Guild.register(interaction.guild.id, interaction.guild.name);
                if (!(await util.User.exists(interaction.user.id))) util.User.register(interaction.user.id, interaction.user.tag, { [interaction.guild.id]: 0 });
                if (!util.Guild.getGuild(interaction.guild.id).hasUser(interaction.user.id)) await util.Guild.getGuild(interaction.guild.id).addUser(interaction.user.id);
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
                    if (interaction.customId.startsWith(command.prefix)) {
                        if (command.defer) await interaction.deferUpdate();
                        command.run(interaction);
                    }
                }
                await util.msg(`[${interaction.customId} (message component)](${interaction.guild?.name ?? "DM"}){${interaction.channel?.name ?? "DM"}}<${interaction.user.tag}>`);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    });

    client.on('messageCreate', async (message) => {
        if (util.isLoadingData()) return;
        if (message.author.bot) return;
        if (!message.guild) return;
        const messagePoints = Math.floor(Math.random() * (50 - 15 + 1) + 15);
        let msgcontent = 'none';
        if (message.content != undefined) {
            msgcontent = message.content;
        }
        if (message.mentions.has(client.user) && msgcontent != 'none' && msgcontent.includes(`<@${client.user?.id}>`)) {
            content = `User:\t${message.author.username}\nServer:\t${message.guild.name}\nchannel:\t${message.channel.name}\nmessage:\t${msgcontent}`;
            util.msg(content, JSONConfig.communityServer, JSONConfig.mentionsChannel);
            message.reply('The bot uses slash commands');
        }
        if (!util.Guild.exists(message.guild.id)) util.Guild.register(message.guild.id, message.guild.name);
        if (!(await util.User.exists(message.author.id))) util.User.register(message.author.id, message.author.tag, { [message.guild.id]: 0 });
        let guild = util.Guild.getGuild(message.guild.id);
        if (!guild) return;
        if (!guild.hasUser(message.author.id)) await guild.addUser(message.author.id);
        (await util.User.getUser(message.author.id))?.setName(message.author.tag);
        guild.setName(message.guild.name);
        (await util.User.getUser(message.author.id)).giveAura(messagePoints, true);
        (await util.User.getUser(message.author.id)).giveCoins(messagePoints * util.Guild.getGuild(message.guild.id).booster, util.Guild.getGuild(message.guild.id));
    });

    client.on('guildCreate', async (guild) => {
        const welcomeMessage = fs.readFileSync('./welcome', 'utf8');
        guild.fetchOwner().then((owner) => { owner.send(welcomeMessage); }).catch(await util.msg(`Bot was added to server ${guild.name}`));
        util.Guild.register(guild.id, guild.name);
    });

    client.on('guildMemberAdd', async (member) => {
        if (!util.Guild.exists(member.guild.id)) util.Guild.register(member.guild.id, member.guild.name);
        if (!(await util.User.exists(member.id))) util.User.register(member.user.id, member.user.tag, { [member.guild.id]: 0 });
        if (!util.Guild.getGuild(member.guild.id).hasUser(member.user.id)) await util.Guild.getGuild(member.guild.id).addUser(member.user.id);
        await util.msg(`user ${member.user.tag} joined server ${member.guild.name}`);
    });

    client.on('error', error => {
        console.error('An error occured with the bot', error);
    });
    client.on('shardError', error => {
        console.error('WebSocket error:', error);
        process.exit(1);
    });

    client.once('ready', async () => {
        await util.msg(`Logged in as ${client.user.tag}! (shard:${client.shard?.ids})`);
        const serverCount = client.guilds.cache.size;
        await util.msg(`The bot is currently in ${serverCount} server(s).`);
        client.user.setPresence({
            activities: [{ name: 'at the Diddy Party', type: 0 }],
            status: 'online',
        });
    });

    client.login(JSONConfig.token);

    // process.on('unhandledRejection', (err) => {
    //     if (err && err.code === 'UND_ERR_CONNECT_TIMEOUT') {
    //         console.error('❌ Connection to Discord API timed out. Exiting...');
    //         process.exit(1);
    //     } else {
    //         console.error('⚠️ Unhandled rejection:', err);
    //     }
    // });

    // process.on('uncaughtException', (err) => {
    //     console.error('Uncaught Exception thrown:', err);
    //     process.exit(1);
    // });

    process.on('exit', (code) => {
        console.log(`Bot (shard) has exited with code ${code}\n${Math.ceil(process.uptime() / 60)} minutes`);
    });

} catch (error) {
    console.error('A fatal error occured in file bot.js', error);
    try { require('./utilities.js').msg(`an error occured in file bot.js:\t${error}`); } catch (e) {}
}
