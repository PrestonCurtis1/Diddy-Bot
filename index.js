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
        intents: [GatewayIntentBits.Guilds]
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
                const reply = await interaction.reply({ content: response, fetchReply: true });

                console.log(`[rizzme] User: ${interaction.user.tag}, Message: ${response}`);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    });

    // Log in to Discord and handle the ready event
    client.once('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    // Login to Discord with the bot token
    client.login(token);
} catch (err) {
    console.error('Fatal error in the script:', err);
}
