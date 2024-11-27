const { deserialize } = require('v8');

try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json'); // Load the bot token and client ID from config.json
    const aura = require("./aura.js");//the system used for updating load and saving aura
    function calculateAura(userId){//function used to calcutate a users aura
        try {
        const MessageList = aura.loadUserMessageLists()[`${userId}`];
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
        const data = fs.readFileSync('./pickup_lines.txt', 'utf8');//the file containing all the pickuplines
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
        //Theres a snake in my boot
        {
            name: 'rizzme',//deliver random pickup line 
            description: 'Receive a random pickup line!',
            dm_permission: true
        },
        {
            name: "oil",//oil me up brosquito
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
            name: "author",//prints the author of the bot
            description: "Get the author of this app",
            dm_permission: true
        },
        {
            name: "announce",//only available for developers of this bot
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
            name: "getaura",//getaurea OM NOM
            description: "display a users aura",
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

    //idk wtf this does tbh
    const rest = new REST({ version: '10' }).setToken(JSONConfig.token);
    //register the / commands
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
    client.on('interactionCreate', async (interaction) => {//handle the / command interactions OMFG im loosing my
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
                if (!USER_IDS.includes(interaction.user.id)){
                    await interaction.reply({content: "You are not authorized to use this command", fetchReply: true, ephemeral : false});
                    return;
                }
                try {
                    await interaction.reply({content: "Sending announcement...", fetchReply: true, ephemeral: false});
                    let successCount = 0;
                    let failCount = 0;
                    for (const guild of client.guilds.cache.values()){
                        try {
                            const members = await guild.members.fetch();

                            const admins = members.filter(member =>
                                member.permissions.has(PermissionsBitField.Flags.Administrator) &&
                                !member.user.bot
                            );
                            for (const admin of admins.values()){
                                try {
                                    await admin.send(announcementMessage);
                                    console.log(`Message sent to ${admin.user.tag} in ${guild.name}`);
                                    successCount++;
                                } catch (error){
                                    console.log(`Failed to message ${admin.user.tag} in ${guild.name} error: ${error}`);
                                    failCount++;
                                }
                            }
                            } catch (error) {
                                console.log(`Failed to fetch members in ${guild.name}`);
                                failCount++;
                            }
                        }
                        await interaction.followUp({content:`Announcement sent! Success: ${successCount} Failed: ${failCount}`, ephemeral: false})
                        console.log(`Announcement sent! Success: ${successCount} Failed: ${failCount}`)
                } catch (error) {
                    console.log('error sending announcements', error)
                }
                console.log(`[announce] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name}`)
            }
            if (interaction.commandName === "getaura") {
                const user = interaction.options.getUser("member")
                if (user === undefined || user === null) user = interaction.user;
                const CalculatedAura = Math.floor(calculateAura(user.id))
                const response = `<@${user.id}> has ${CalculatedAura} aura and has a sigma level of ${Math.floor(CalculatedAura/150)}`;
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
