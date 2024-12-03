const { Client, GatewayIntentBits } = require('discord.js');
const JSONConfig = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] // Ensure the necessary intents are enabled
});

// Function to send a message to a specific channel in a specific server
async function sendMessage(logMessage,guildId="1310772622044168275", channelId="1310982567398342737") {
    try {
        // Fetch the guild using its ID
        const guild = await client.guilds.fetch(guildId);
        
        // Fetch the channel using its ID
        const channel = await guild.channels.fetch(channelId);

        // Check if the channel is text-based and send the message
        if (channel.isTextBased()) {
            //use console.log instead of sendMessage in this function because other-wise it will loop infinitely
            await channel.send(logMessage);
            console.log(`Message sent to ${channel.name} in guild ${guild.name}: ${logMessage}`);
        } else {
            console.log('The specified channel is not a text channel.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}
async function guildIdToName(guildId){
    const guild = client.guilds.cache.get(guildId);

    if (guild) {
        sendMessage(`The name of the guild with ID ${guildId} is: ${guild.name}`);
    } else {
        sendMessage(`Guild with ID ${guildId} not found.`);
    }
    return guild.name;
}

// When the client is ready, you can use the sendMessage function
client.once('ready', () => {
    sendMessage(`Logged in as ${client.user.tag} utilities.js`);
    // Example usage: Send a message to a specific server and channel
});
module.exports = {
    sendMessage,
    guildIdToName,
}
// Log in with your bot token
client.login(JSONConfig.token);
