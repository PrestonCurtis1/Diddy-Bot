const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const JSONConfig = require("./config.json");
const utilities = require("./utilities.js");
// Create a new Discord client instance
utilities.sendMessage
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Required to fetch guild members
        GatewayIntentBits.GuildInvites  // Required to manage and fetch invites
    ],
});

client.once('ready', async () => {
    utilities.sendMessage(`Logged in as ${client.user.tag}! invite.js`);

    // Log the number of servers the bot is in
    utilities.sendMessage(`The bot is currently in ${client.guilds.cache.size} server(s).`);

    // Loop through all guilds the bot is in
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            // Fetch members to ensure they are cached
            await guild.members.fetch();

            // Fetch existing invites
            const invites = await guild.invites.fetch();
            const validInvite = invites.find(invite => !invite.expiresAt && !invite.revoked);

            if (!validInvite) {
                // Create a new invite if no valid one exists
                const targetChannel = guild.channels.cache.find(channel => 
                    channel.isTextBased()
                );

                if (!targetChannel) {
                    console.warn(`No suitable channel to create an invite in guild: ${guild.name}`);
                    continue; // Skip if no suitable channel is found to create an invite
                }

                const newInvite = await targetChannel.createInvite({
                    maxAge: 0,   // Permanent invite
                    maxUses: 0,  // Unlimited uses
                    unique: true,
                    reason: 'Generated by bot',
                });

                utilities.sendMessage(`New invite created for guild: ${guild.name} -> ${newInvite.url}`);
            } else {
                utilities.sendMessage(`Valid invite found for guild: ${guild.name} -> ${validInvite.url}`);
            }

        } catch (error) {
            utilities.sendMessage(`Error processing guild: ${guild.name} - ${error.message}`);
        }
    }
});

// Login to Discord with the bot token
client.login(JSONConfig.token).catch(error => {
    console.error(`Failed to log in: ${error}`);
});
