const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json'); // Load the bot token from config.json

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
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    // Check if the command is !rizzme
    if (message.content.toLowerCase() === '!rizzme') {
        // Log the user and the command in the console

        // Send a random pickup line
        const response = PICKUP_LINES[Math.floor(Math.random() * PICKUP_LINES.length)];
        const botMessage = await message.reply(response)
        console.log(`[rizzme] User: ${message.author.tag}, Message: ${response}`);

        // Delete the command and the response after 30 seconds
        setTimeout(async () => {
            try {
                await message.delete();
                await botMessage.delete();
            } catch (error) {
                console.error('Failed to delete messages:', error);
            }
        }, 30000); // 30 seconds
    }
});
// Login to Discord with the bot token
client.login(token);
