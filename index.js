const { deserialize } = require('v8');

try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json'); // Load the bot token and client ID from config.json
    const aura = require("./aura.js");
    function calculateExp(userId){
        try {
        const MessageList = aura.loadUserMessageLists()[`${userId}`];
        console.log(`${aura.loadUserMessageLists()}`)
        console.log(`${MessageList}`);
        console.log(`${userId}`);
        const MessageTotal = MessageList[0];
        const Multiplier = 1+(MessageList[0]/MessageList[1])/100;
        const totalAura = MessageTotal * Multiplier;
        return totalAura;
        } catch (error){
            console.log(`error occured calculating aura for${userId}`)
            return 0;
        }
    }
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
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ]
    });

    // Define and register the slash command
    const commands = [
        {
            name: 'rizzme',
            description: 'Receive a random pickup line!',
            dm_permission: true
        },
        {
            name: "oil",
            description: "oil up your friends",
            dm_permission: true,
            options: [
                {
                    name: 'user',
                    type: 6, // Type 6 means 'USER' for selecting a user
                    description: 'Choose a user to oil up',
                    required: true // Again, optional
                }
            ]
        },
        {
            name: "author",
            description: "Get the author of this app",
            dm_permission: true
        },
        {
            name: "announce",
            description: "Send a dm to server admins",
            dm_permission: true,
            options: [
                {
                    name: "message",
                    type: 3,
                    description: "Message to send",
                    required: true
                }
            ]
        },
        {
            name: "getaura",
            description: "display a users experience",
            dm_permission: true,
            options: [
                {
                    name: "member",
                    type: 6,
                    description: "User to get aura of",
                    required: false
                }
            ]
        }
    ];

    const rest = new REST({ version: '10' }).setToken(JSONConfig.token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(Routes.applicationCommands(JSONConfig.clientId), {
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
                await interaction.reply({content: response, fetchReply: true });

                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                console.log(`[rizzme] User: ${interaction.user.tag}, Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
            if (interaction.commandName === 'oil') {
                // Get the user from the command options
                const target = interaction.options.getUser("user");
                const oiler = interaction.user;
            
                if (!target) {
                    return interaction.reply({ content: "You need to mention someone to oil up!", fetchReply: true, ephemeral: true });
                }
            
                // Create the response with proper mentions and IDs
                const response = `<@${oiler.id}> oiled up <@${target.id}>`;
            
                // Send the reply
                await interaction.reply({ content: response, fetchReply: true });
            
                // Log details to the console
                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                console.log(`[oil] Oiler: ${oiler.tag} (${oiler.id}), Target: ${target.tag} (${target.id}), Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
            if (interaction.commandName === 'author') {
                const response = "the author of <@1305713838775210015> is <@790709753138905129>";
                await interaction.reply({content: response, fetchReply: true});
                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                console.log(`[author] User: ${interaction.user.tag}} (${interaction.user.id}) Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
            if (interaction.commandName === "announce"){
                USER_IDS = ["790709753138905129","1287135434954113104"];
                const announcementFile = interaction.options.getString("message")
                const announcementMessage = fs.readFileSync(`./${announcementFile}`,"utf-8");
                console.log("test1");
                if (!USER_IDS.includes(interaction.user.id)){
                    await interaction.reply({content: "You are not authorized to use this command", fetchReply: true, ephemeral : true});
                    console.log("test2");
                    return;
                }
                try {
                    await interaction.reply({content: "Sending announcement...", fetchReply: true, ephemeral: true});
                    console.log("test3");
                    let successCount = 0;
                    let failCount = 0;
                    for (const guild of client.guilds.cache.values()){
                        try {
                            console.log("test4");
                            const members = await guild.members.fetch();

                            const admins = members.filter(member =>
                                member.permissions.has(PermissionsBitField.Flags.Administrator) &&
                                !member.user.bot
                            );
                            console.log("test5");
                            for (const admin of admins.values()){
                                try {
                                    console.log("test6");
                                    await admin.send(announcementMessage);
                                    console.log(`Message sent to ${admin.user.tag} in ${guild.name}`);
                                    successCount++;
                                } catch (error){
                                    console.log("test7");
                                    console.log(`Failed to message ${admin.user.tag} in ${guild.name}`);
                                    failCount++;
                                }
                            }
                            console.log("test8");
                            } catch (error) {
                                console.log(`Failed to fetch members in ${guild.name}`);
                                failCount++;
                            }
                        }
                        console.log("test9");
                        await interaction.followUp({content:`Announcement sent! Success: ${successCount} Failed: ${failCount}`, ephemeral: true})
                        console.log(`Announcement sent! Success: ${successCount} Failed: ${failCount}`)
                } catch (error) {
                    console.log('error sending announcements', error)
                }
                console.log("test10");
                console.log(`[announce] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name}`)
            }
            if (interaction.commandName === "getaura") {
                user = interaction.options.getUser("member")// ?? interaction.user;
                if (user === undefined || user === null) user = interaction.user;
                const response = `<@${user.id}> has ${Math.floor(calculateExp(user.id))} aura`;
                await interaction.reply({content: response, fetchReply: true});
                console.log(`[getaura] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name} Response: ${response}`);
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    });

    // Log in to Discord and handle the ready event
    client.once('ready', async () => {
        console.log(`Logged in as ${client.user.tag}! index.js`);

        // Log the number of servers the bot is in
        const serverCount = client.guilds.cache.size;
        console.log(`The bot is currently in ${serverCount} server(s).`);
        client.user.setPresence({
            activities: [{ name: 'at the Diddy Party', type: 0 }], // Type 0 is "Playing"
            status: 'online', // Status can be 'online', 'idle', 'dnd', or 'invisible'
        });
    });

    // Login to Discord with the bot token
    
    client.login(JSONConfig.token);
} catch (err) {
    console.error('Fatal error in the script: index.js', err);
}
