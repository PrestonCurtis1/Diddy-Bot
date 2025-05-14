try {
    const { Client, GatewayIntentBits } = require('discord.js');
    const fs = require('fs');
    const path = './userMessageLists.json'; // Path to store the user-specific message lists
    const JSONConfig = require("./config.json");
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    const utilities = require("./utilities.js");

    // Function to load the user message lists from the file
    function loadUserMessageLists() {
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path, 'utf-8');
        utilities.sendMessage("loaded userMessageLists");
        return JSON.parse(data); // Parse the JSON data into an object
    }
    return {}; // Return an empty object if the file doesn't exist
    }
    let userMessageLists = loadUserMessageLists(); // Object to store message lists for each user

    // Function to save the user message lists to the file
    function saveUserMessageLists() {
        for (const messageList in userMessageLists){
            if (userMessageLists[messageList][1] <= 0){//set to 0 if negative
                userMessageLists[messageList][1] = 1;
            }
        }
        fs.writeFileSync(path, JSON.stringify(userMessageLists, null, 2), 'utf-8'); // Save as JSON
    }

    function calculateAura(userId){//function used to calcutate a users aura
        try {
            const MessageList = loadUserMessageLists()[userId];
            const MessageTotal = MessageList[0];
            const Multiplier = getMultiplier(userId);
            const totalAura = MessageTotal * Multiplier;
            return totalAura;//(Math.floor(userMessageLists[userId][0]/userMessageLists[userId][1]))
        } catch (error){
            utilities.sendMessage(`error occured calculating aura for${userId}`,error)
            return 0;
        }
    }
    function getMultiplier(userId){
        //2x if they are boosting the server and another 2x if they are boosting the diddy server
        return 1;
    }
    function giveAura(userId,amount){
        if (!userMessageLists[userId]){
            userMessageLists[userId] = [0,0];//the equivelent of them sending one message with them having to send a message
        }
        if (amount > 0){//if amount is positive
            userMessageLists[userId][0] += amount;
        } else{//if amount is negative
            userMessageLists[userId][0] += amount;
        }
        saveUserMessageLists();
    }
    function pay(senderId,receiverId,auraAmount){
        if (auraAmount <= 0){
            return "must be positive"
        }
        if (userMessageLists[senderId][0] < auraAmount ){
            return `insufficient funds ${userMessageLists[senderId][0]} < ${auraAmount}`
        } else{
            userMessageLists[senderId][0] -= auraAmount;
            if (!userMessageLists[receiverId]){
                userMessageLists[receiverId] = [0,0];
            }
            userMessageLists[receiverId][0] += auraAmount;
            utilities.sendMessage(`${senderId} payed ${receiverId}: ${auraAmount} aura`);
        }
        saveUserMessageLists();
    }

    // Load the user message lists when the bot starts
    userMessageLists = loadUserMessageLists();

    // Message creation event
    client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignore bot messages
    const userId = message.author.id; // Get the user's ID
    // Initialize message list for the user if not already
    if (!userMessageLists[userId]) {
        utilities.sendMessage(`initializing user ${message.author.username}|${message.author.id}`);
        userMessageLists[userId] = [0,0]; // Create a new message list for the user
    }

    // Calculate points for the message
    const messagePoints = Math.floor(Math.random() * (50 - 15 + 1) + 15);
    utilities.sendMessage(`${message.author.username} sent a message in server ${message.guild.name} channel ${message.channel.name} worth ${messagePoints}`);

    // Add the calculated points to the user's message list
    giveAura(userId,messagePoints);

    // Save the updated user message lists to the file
    });

    // Handle message deletions by the user
    client.on('messageDelete', (message) => {
    if (message.author.bot) return; // Ignore bot messages

    const userId = message.author.id; // Get the user's ID

    // Check if the user has a message list
    if (userMessageLists[userId]) {
        const messagePoints = 25;
        userMessageLists[userId][0] -= messagePoints;
        

        // Save the updated user message lists to the file
    }
    });
    // Handle user timeout (punishment)
    client.on('guildMemberUpdate', (oldMember, newMember) => {
    // Example: Check if a member is timed out (you can adjust the logic for specific timeouts)
    if (oldMember.communicationDisabledUntil !== newMember.communicationDisabledUntil) {
        const userId = newMember.id;
        const timeoutDuration = (newMember.communicationDisabledUntil - Date.now()) / 1000 / 3600; // Timeout duration in hours
        if (timeoutDuration > 0) {
        const timeoutPunishment = (25 * timeoutDuration)*-1;

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
        utilities.sendMessage(`Logged in as ${client.user.tag}! aura.js`);
    })
    // Log in to the bot
    module.exports = {
        saveUserMessageLists,
        loadUserMessageLists,
        calculateAura,
        giveAura,
        pay,
        getMultiplier,
    };
    client.login(JSONConfig.token);
} catch (error) {
    console.error('Fatal error in the script: aura.js', error);
}
