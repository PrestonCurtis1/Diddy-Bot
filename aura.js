try {
    const { Client, GatewayIntentBits } = require('discord.js');
    const fs = require('fs');
    const path = './userMessageLists.json'; // Path to store the user-specific message lists
    const JSONConfig = require("./config.json");
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    let userMessageLists = {}; // Object to store message lists for each user

    // Function to load the user message lists from the file
    function loadUserMessageLists() {
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path, 'utf-8');
        console.log("loaded userMessageLists");
        return JSON.parse(data); // Parse the JSON data into an object
    }
    return {}; // Return an empty object if the file doesn't exist
    }

    // Function to save the user message lists to the file
    function saveUserMessageLists() {
    fs.writeFileSync(path, JSON.stringify(userMessageLists, null, 2), 'utf-8'); // Save as JSON
    console.log("saved userMessageLists");
    }

    // Load the user message lists when the bot starts
    userMessageLists = loadUserMessageLists();

    // Message creation event
    client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages
    console.log(`${message.author.tag} sent message in server ${message.guild.name} channel ${message.channel.name}`);
    const userId = message.author.id; // Get the user's ID

    // Initialize message list for the user if not already
    if (!userMessageLists[userId]) {
        userMessageLists[userId] = [0,0]; // Create a new message list for the user
    }

    // Calculate points for the message
    const messagePoints = 25 + (message.content.length / 20) + (30 * (message.attachments.size + message.embeds.length));

    // Add the calculated points to the user's message list
    userMessageLists[userId][0] += messagePoints;
    userMessageLists[userId][1]++;

    // Save the updated user message lists to the file
    });

    // Handle message deletions by the user
    client.on('messageDelete', (message) => {
        console.log(`${message.author.tag} had message deleted in server ${message.guild.name} channel ${message.channel.name}`);
    if (message.author.bot) return; // Ignore bot messages

    const userId = message.author.id; // Get the user's ID

    // Check if the user has a message list
    if (userMessageLists[userId]) {
        const messagePoints = (25 + (message.content.length / 20) + (30 * (message.attachments.size + message.embeds.length)))*2;
        userMessageLists[userId][0] -= messagePoints;
        userMessageLists[userId][1]++;
        

        // Save the updated user message lists to the file
    }
    });
    // Handle user timeout (punishment)
    client.on('guildMemberUpdate', (oldMember, newMember) => {
    // Example: Check if a member is timed out (you can adjust the logic for specific timeouts)
    if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
        const userId = newMember.id;
        const timeoutDuration = (newMember.communicationDisabledUntil - Date.now()) / 1000 / 3600; // Timeout duration in hours
        console.log(`${newMember.tag} was timed out for ${timeoutDuration} hours`);
        if (timeoutDuration > 0) {
        const timeoutPunishment = (100 * timeoutDuration)*-1;

        // If the user has a message list, apply punishment
        if (userMessageLists[userId]) {
            userMessageLists[userId][0] -= timeoutPunishment;

            // Save the updated user message lists to the file
        }
        }
    }
    });

    // Optionally, save periodically (every 5 minutes) to ensure the user message lists are updated regularly
    setInterval(saveUserMessageLists, 60 * 1000); // Save every 1 minutes
    client.once("ready", async () => {
        console.log(`Logged in as ${client.user.tag}! aura.js`);
    })
    // Log in to the bot
    module.exports = {
        saveUserMessageLists,
        loadUserMessageLists,
    };
    client.login(JSONConfig.token);
} catch (err) {
    console.error('Fatal error in the script: aura.js', err);
}