try {
    const { Client, GatewayIntentBits } = require('discord.js');
    const fs = require('fs');
    const path = './userMessageLists.json'; // Path to store the user-specific message lists
    const JSONConfig = require("./config.json");
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
    const utilities = require("./utilities.js");
    // Message creation event
    client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages
    const userId = message.author.id; // Get the user's ID
    const guildId = message.guild.id;
    if (!utilities.User.all[userId]) {
        if (!utilities.Guild.all[guildId]){
            new utilities.Guild(guildId,message.guild.name,0,{"about":"","features":[],"invite-code":"","showAdInDiddyBotServer":false},{"id":guildId,"items":[],"balance":0,"config":{"buyCoins":true,"buyCoinCost":20,"shopAdminRole":""}})
        }
        new utilities.User(userId,message.author.username,0,{"temp":{"multi":0,"endTime":new Date},"perm":0},{[guildId]:0}); // Create a new message list for the user
    }

    // Calculate points for the message
    const messagePoints = 25 + (message.content.length / 20) + (30 * (message.attachments.size + message.embeds.length));
    utilities.User.getUser(userId).giveAura(messagePoints,true);
    
    if(!utilities.User.getUser(userId).guilds[guildId]){
        if(!utilities.Guild.all[guildId]){
            new utilities.Guild(guildId,message.guild.name,0,{"about":"","features":[],"invite-code":"","showAdInDiddyBotServer":false},{"id":guildId,"items":[],"balance":0,"config":{"buyCoins":true,"buyCoinCost":20,"shopAdminRole":""}})
        } else {
            utilities.Guild.getGuild(guildId).addUser({"user":utilities.User.getUser(userId),"coins":0});
        }
    }
    utilities.User.getUser(userId).giveCoins(messagePoints,utilities.Guild.getGuild(guildId));

    // Save the updated user message lists to the file
    });

    // Handle user timeout (punishment)
    // Optionally, save periodically (every 5 minutes) to ensure the user message lists are updated regularly
    client.once("ready", async () => {
        utilities.sendMessage(`Logged in as ${client.user.tag}! aura.js`);
    })
    // Log in to the bot
    client.login(JSONConfig.token);
} catch (error) {
    console.error('Fatal error in the script: aura.js', error);
}