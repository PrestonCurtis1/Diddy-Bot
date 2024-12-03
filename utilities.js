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
            await channel.send(logMessage);
            console.log(`Message sent to ${channel.name} in guild ${guild.name}: ${logMessage}`);
        } else {
            console.log('The specified channel is not a text channel.');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// When the client is ready, you can use the sendMessage function
client.once('ready', () => {
    sendMessage(`Logged in as ${client.user.tag} utilities.js`);
    
    // Example usage: Send a message to a specific server and channel
});
module.exports = {
    sendMessage,
}
// Log in with your bot token
client.login(JSONConfig.token);
