const { deserialize } = require('v8');


try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json'); // Load the bot token and client ID from config.json
    const aura = require("./aura.js");//the system used for updating load and saving aura
    const shop = require("./shop.js");
    const utilities = require ("./utilities.js");    
    // Read pickup lines from the file
    let PICKUP_LINES = [];
    try {
        const data = fs.readFileSync('./pickup_lines.txt', 'utf8');//the file containing all the pickuplines
        PICKUP_LINES = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    } catch (error) {
        utilities.sendMessage(`Error reading pickup_lines.txt: ${error}`);
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
            name: "authors",//prints the author of the bot
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
                    required: true
                }
            ]
        },
        {
            name: "diddle",
            description: "Diddle your friends",
            dm_permission: true,
            options: [
                {
                    name: 'user',
                    type: 6,
                    description: 'Choose a user to diddle',
                    required: true
                }
            ]
        },
        {
            name: "addShopRole".toLowerCase(),
            description: "add a role to your servers shop",
            dm_permission: true,
            options: [
                {
                    name: "role",
                    type: 8,
                    description: "role to add",
                    required: true
                },
                {
                    name: "price",
                    type: 10,
                    description: "aura needed for the role",
                    required: true
                }
            ]
        },
        {
            name: "removeShopRole".toLowerCase(),
            description: "remove a role from your shop",
            dm_permission: true,
            options: [
                {
                    name: "role",
                    type: 8,
                    description: "role to remove",
                    required: true
                }
            ]
        },
        {
            name: "buyShopRole".toLowerCase(),
            description: "buy a role from shop",
            dm_permission: true,
            options: [
                {
                    name: "role",
                    type: 8,
                    description: "role to buy",
                    required: true
                }
            ]
        },
        {
            name:"shop",
            description: "list the roles you can buy",
            dm_permission: true
        },
        {
            name:"giveAura".toLowerCase(),
            description: "give aura to a user (bot admins only)",
            dm_permission: true,
            options: [
                {
                    name: "user",
                    type:6,
                    description: "user to give aura to",
                    required:true
                },
                {
                    name: "aura",
                    type: 10,
                    description: "amount of aura to give",
                    required: true
                }
            ]
        },
        {
            name: "discord",
            description: "Join our discord server",
            dm_permission: true
        },
        {
            name: "rizzlers",
            description: "people who contributed pickup-lines",
            dm_permission: true
        }
    ];

    //idk wtf this does tbh
    const rest = new REST({ version: '10' }).setToken(JSONConfig.token);
    //register the / commands
    (async () => {
        try {
            utilities.sendMessage('Started refreshing application (/) commands.');

            await rest.put(Routes.applicationCommands(JSONConfig.clientId), {
                body: commands,
            });

            utilities.sendMessage('Successfully reloaded application (/) commands.');
        } catch (error) {
            utilities.sendMessage(`Error registering commands: ${error}`);
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
                utilities.sendMessage(`[rizzme] User: ${interaction.user.tag}, Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
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
                await interaction.reply({ content: response, fetchReply: true, allowedMentions: {parse: []} });
            
                // Log details to the console
                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                utilities.sendMessage(`[oil] Oiler: ${oiler.tag} (${oiler.id}), Target: ${target.tag} (${target.id}), Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
            if (interaction.commandName === 'authors') {
                const response = "the authors of <@1305713838775210015> \n **Founder**: <@790709753138905129> \n **Developer**: <@799101657647415337>,<@1005413712536023100>\n **Admin**:<@1307191266525839481>,<@1215373521463681147>,<@1248851515901481095>";
                await interaction.reply({content: response, fetchReply: true});
                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                utilities.sendMessage(`[authors] User: ${interaction.user.tag}} (${interaction.user.id}) Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
            if (interaction.commandName === "announce"){
                USER_IDS = ["790709753138905129"];
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
                            const owner = await guild.fetchOwner();
                            await owner.send(announcementMessage);
                            utilities.sendMessage(`Message sent to ${owner.user.tag} in ${guild.name}`);
                            successCount++;
                            
                            } catch (error) {
                                utilities.sendMessage(`Failed to message the owner of ${guild.name} error: ${error}`);
                                failCount++;
                            }
                        }
                        await interaction.followUp({content:`Announcement sent! Success: ${successCount} Failed: ${failCount}`, ephemeral: false})
                        utilities.sendMessage(`Announcement sent! Success: ${successCount} Failed: ${failCount}`)
                } catch (error) {
                    utilities.sendMessage(`error sending announcements, ${error}`)
                }
                utilities.sendMessage(`[announce] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name}`)
            }
            if (interaction.commandName === "getaura") {
                const user = interaction.options.getUser("member")
                if (user === undefined || user === null) user = interaction.user;
                utilities.sendMessage(`user index.js ${user.id}`)
                const CalculatedAura = Math.floor(aura.calculateAura(user.id))
                const response = `<@${user.id}> has ${CalculatedAura} aura and has a sigma level of ${Math.floor(CalculatedAura/150)}`;
                await interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
                utilities.sendMessage(`[getaura] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name} Response: ${response}`);
            }
            if (interaction.commandName === "diddle") {
                // Get the user from the command options
                const target = interaction.options.getUser("user");

                if (!target) {
                    return interaction.reply({ content: "You need to mention someone to diddle!", fetchReply: true, ephemeral: true });
                }

                // Create the response with proper mention and ID
                const response = `<@${target.id}> has been diddled`;

                // Send the reply
                await interaction.reply({ content: response, fetchReply: true, allowedMentions: {parse: []} });

                const channelName = interaction.channel ? interaction.channel.name : 'DM';
                const serverName = interaction.guild ? interaction.guild.name : 'DM';
                utilities.sendMessage(`[diddle] User: ${interaction.user.tag} Target: ${target.tag} (${target.id}), Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
            }
            if (interaction.commandName === "addShopRole".toLowerCase()){
                const response = shop.addShopRole(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator),interaction.options.getRole("role"),interaction.options.getNumber("price"),interaction.guild.id);
                interaction.reply({content: response, fetchReply: true})
            }
            if (interaction.commandName === "removeShopRole".toLowerCase()){
                const response = shop.removeShopRole(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator),interaction.options.getRole("role"),interaction.guild.id);
                interaction.reply({content: response, fetchReply: true})
            }
            if (interaction.commandName === "buyShopRole".toLowerCase()){
                const response = await shop.buyShopRole(interaction.options.getRole("role"),interaction.user.id,interaction.guild.id);
                interaction.reply({content: response, fetchReply: true})
            }
            if (interaction.commandName === "shop"){
                const response = shop.listShopRoles(interaction.guild.id,interaction.user.id);
                interaction.reply({content: response, fetchReply: true})
            }
            if (interaction.commandName === "giveAura".toLowerCase()){
                const communityServer = await client.guilds.fetch("1310772622044168275");
                const member = guild.members.fetch(interaction.user.id);
                //admins = ["770048162395586611","799101657647415337","1215373521463681147","790709753138905129","1305713838775210015","1307191266525839481","1248851515901481095"];
                let message;
                if (member.permission.has(PermissionsBitField.Flags.Administrator)){
                //if (admins.includes(interaction.user.id)){
                    const target = interaction.options.getUser("user");
                    const auraPrice = interaction.options.getNumber("aura")
                    aura.giveAura(target.id,auraPrice);
                    message = `<@${target.id}> has been given ${auraPrice} aura by <@${interaction.user.id}>`;
                } else {
                    message = `this command can only be run by bot admins`;
                }
                interaction.reply({content: message, fetchReply: true, allowedMentions: {parse: []}});
                utilities.sendMessage(`[giveAura] server:\t${interaction.guild.name} channel:\t${interaction.channel.name} target:\t${target.name} user:\t${interaction.user.name} price\t${auraPrice} message:\t${message}`)
            }
            if (interaction.commandName === "discord"){
                interaction.reply({content: "Join our diddy-bot community  [discord server](https://discord.gg/u6AVRt7Bgm)",fetchReply:true});
            }
            if (interaction.commandName === 'rizzlers') {
                interaction.reply({content: "@unprankable01\n@houdert6\n@owcapl_\nContribute a pickupline to be added :)\n[Diddy Bot Pickup Lines - FORM](https://docs.google.com/forms/d/e/1FAIpQLSdLM2-i72__bdf2ht9xthyhhXMqATBbaS7ZCX5M9BiahkeJ6Q/viewform?usp=dialog)",fetchReply: true,allowedMentions: {parse: []}})
            }
        } catch (error) {
            utilities.sendMessage(`Error handling interaction:, ${error}`);
        }
    });

    // Log in to Discord and handle the ready event
    client.once('ready', async () => {
        utilities.sendMessage(`Logged in as ${client.user.tag}! index.js`);

        // Log the number of servers the bot is in
        const serverCount = client.guilds.cache.size;
        utilities.sendMessage(`The bot is currently in ${serverCount} server(s).`);
        client.user.setPresence({
            activities: [{ name: 'at the Diddy Party', type: 0 }], // Type 0 is "Playing"
            status: 'online', // Status can be 'online', 'idle', 'dnd', or 'invisible'
        });
    });

    // Login to Discord with the bot token
    client.login(JSONConfig.token);
} catch (err) {
    console.log("fatal error occured",err)
    //utilities.sendMessage("Fatal error in the script: index.js"+err+"");
}
