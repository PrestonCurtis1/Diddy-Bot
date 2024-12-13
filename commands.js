try{
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const util = require("./utilities.js");
    const fs = require("fs");
    const JSONConfig = require("./config.json");
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
    //rizzme
    async function rizzme(interaction){
        let PICKUP_LINES = [];
        try {
            const data = fs.readFileSync('./pickup_lines.txt', 'utf8');//the file containing all the pickuplines
            PICKUP_LINES = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
        } catch (error) {
            console.error("Error reading pickup_lines.txt:",error);
            process.exit(1); // Exit if the file cannot be read
        }
        // Send a random pickup line
        const response = PICKUP_LINES[Math.floor(Math.random() * PICKUP_LINES.length)];
        await interaction.reply({content: response, fetchReply: true });
        const channelName = interaction.channel ? interaction.channel.name : 'DM';
        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        util.msg(`[rizzme] User: ${interaction.user.tag}, Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
    }
    new util.Command({name: 'rizzme',description: 'Receive a random pickup line!',dm_permission: true},rizzme);
    //oil
    async function oil(interaction){
        // Get the user from the command options
        const target = interaction.options.getUser("user");
        const oiler = interaction.user;

        if (!target) {
            return await interaction.reply({ content: "You need to mention someone to oil up!", fetchReply: true, ephemeral: true });
        }

        // Create the response with proper mentions and IDs
        const response = `<@${oiler.id}> oiled up <@${target.id}>`;

        // Send the reply
        await interaction.reply({ content: response, fetchReply: true });

        const channelName = interaction.channel ? interaction.channel.name : 'DM';
        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        util.msg(`[oil] Oiler: ${oiler.tag} (${oiler.id}), Target: ${target.tag} (${target.id}), Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
    }
    new util.Command({name: "oil",/*oil me up brosquito*/description: "oil up your friends",dm_permission: true,options: [{name: 'user',type: 6, description: 'Choose a user to oil up',required: true}]},oil);
    //authors
    async function authors(interaction){
        const response = "the authors of <@1305713838775210015> are <@790709753138905129> and <@799101657647415337>";
        await interaction.reply({content: response, fetchReply: true});
        const channelName = interaction.channel ? interaction.channel.name : 'DM';
        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        util.msg(`[authors] User: ${interaction.user.tag}} (${interaction.user.id}) Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
    }
    new util.Command({name: "authors",description: "Get the authors of this bot",dm_permission: true},authors);
    //announce 
    async function announce(interaction){
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
                    const owner = await guild.fetchOwner();
                    await owner.send(announcementMessage);
                    util.msg(`Message sent to ${owner.user.tag} in ${guild.name}`);
                    successCount++;
                    
                    } catch (error) {
                        util.msg(`Failed to message the owner of ${guild.name} error: ${error}`);
                        failCount++;
                    }
                }
                await interaction.followUp({content:`Announcement sent! Success: ${successCount} Failed: ${failCount}`, ephemeral: false})
                util.msg(`Announcement sent! Success: ${successCount} Failed: ${failCount}`)
        } catch (error) {
            util.msg(`error sending announcements, ${error}`)
        }
        util.msg(`[announce] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name}`)
    }
    new util.Command({name: "announce",description: "Send a dm to server owners",dm_permission: true,options: [{name: "message",type: 3,description: "Message file to send",required: true}]},announce);
    //getAura 
    async function getAura(interaction){
        const user = interaction.options.getUser("member")
        if (user === undefined || user === null) user = interaction.user;
        util.msg(`user index.js ${user.id}`)
        const CalculatedAura = Math.floor(util.User.getUser(user.id)?.aura ?? 0);
        const response = `<@${user.id}> has ${CalculatedAura} aura and has a sigma level of ${util.User.getUser(user.id)?.level ?? 0}`;
        await interaction.reply({content: response, fetchReply: true});
        util.msg(`[getaura] user: ${interaction.user.tag} Server: ${interaction.guild.name} Channel: ${interaction.channel.name} Response: ${response}`);
    }
    new util.Command({name: "getAura".toLowerCase(),description: "display a users aura",dm_permission: true,options: [{name: "member",type: 6,description: "User to get aura of",required: true}]},getAura);
    //diddle
    async function diddle(interaction){
        // Get the user from the command options
        const target = interaction.options.getUser("user");

        if (!target) {
            return await interaction.reply({ content: "You need to mention someone to diddle!", fetchReply: true, ephemeral: true });
        }

        // Create the response with proper mention and ID
        const response = `<@${target.id}> has been diddled`;

        // Send the reply
        await interaction.reply({ content: response, fetchReply: true });

        const channelName = interaction.channel ? interaction.channel.name : 'DM';
        const serverName = interaction.guild ? interaction.guild.name : 'DM';
        util.msg(`[diddle] User: ${interaction.user.tag} Target: ${target.tag} (${target.id}), Server: ${serverName}, Channel: ${channelName}, Message: ${response}`);
    }
    new util.Command({name: "diddle",description: "Diddle your friends",dm_permission: true,options: [{name: 'user',type: 6,description: 'Choose a user to diddle',required: true}]},diddle);
    //addShopItem 
    async function addShopItem(interaction){
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).shop.addShopItem(interaction.options.getString("type"),interaction.options.getString("id"),interaction.options.getNumber("coins"));
            await interaction.reply({content:`Added ${interaction.options.getString("type")} with id ${interaction.options.getString("id")} to shop for ${interaction.options.getNumber("coins")} coins`, fetchReply: true})
        } else {
            await interaction.reply({content: "You do not have permission to run this command", fetchReply: true})
        }
    }
    new util.Command({name: "addShopItem".toLowerCase(),description: "add a item to your servers shop",dm_permission: false,options: [{name: "type",type: 3,description: "channel or role",required: true},{name: "id",type: 3,description: "id of channel or role",required: true},{name: "coins",type: 10,description: "price of shop item",required: true}]},addShopItem);
    //removeShopItem
    async function removeShopItem(interaction){
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).shop.removeShopItem(interaction.options.getString("type"),interaction.options.getString("id"));
            await interaction.reply({content:`Removed ${interaction.options.getString("type")} with id ${interaction.options.getString("id")} from shop`, fetchReply: true})
        } else {
            await interaction.reply({content: "You do not have permission to run this command", fetchReply: true})
        }
    }
    new util.Command({name: "removeShopItem".toLowerCase(),description: "remove a item from your shop",dm_permission: false,options: [{name: "type",type: 3,description: "channel or role",required: true},{name: "id",type: 3,description: "id of channel ore role",required: true}]},removeShopItem);
    //buyShopItem 
    async function buyShopItem(interaction){
        const guild = util.Guild.getGuild(interaction.guild.id);
        const shopItem = util.Guild.getGuild(interaction.guild.id).shop.items.filter(item => item["type"] === interaction.options.getString("type") && item["itemInfo"] === interaction.options.getString("id"))[0];
        const response = guild.shop.buyShopItem(shopItem,util.Guild.getGuild(interaction.guild.id),util.User.getUser(interaction.user.id))
        await interaction.reply({content: response,fetchReply: true});
    }
    new util.Command({name: "buyShopItem".toLowerCase(),description: "buy a item from shop",dm_permission: false,options: [{name: "type",type: 3,description: "channel or role",required: true},{name: "id",type: 3,description: "channel/role to buy",required: true}]},buyShopItem);
    async function shop(interaction){
        const response = util.Guild.getGuild(interaction.guild.id).shop.showShop();
        await interaction.reply({content: response, fetchReply: true})
    }
    new util.Command({name:"shop",description: "list the items you can buy",dm_permission: false},shop);
    //giveAura 
    async function giveAura(interaction){
        admins = ["799101657647415337","1215373521463681147","790709753138905129"];
        let message;
        const target = interaction.options.getUser("user");
        const auraAmount = interaction.options.getNumber("aura")
        if (admins.includes(interaction.user.id)){
            util.User.getUser(interaction.user.id).giveAura(auraAmount,false);
            message = `<@${target.id}> has been given ${auraAmount} aura by <@${interaction.user.id}>`;
        } else {
            message = `this command can only be run by bot admins`;
        }
        await interaction.reply({content: message, fetchReply: true});
        util.msg(`[giveAura] server:\t${interaction.guild.name} channel:\t${interaction.channel.name} target:\t${target.name} user:\t${interaction.user.name} price\t${auraAmount} message:\t${message}`)
    }
    new util.Command({name:"giveAura".toLowerCase(),description: "give aura to a user (bot admins only)",dm_permission: true,options: [{name: "user",type:6,description: "user to give aura to",required:true},{name: "aura",type: 10,description: "amount of aura to give",required: true}]},giveAura);
    //discord
    async function discord(interaction){
        await interaction.reply({content: "Join our diddy-bot community  [discord server](https://discord.gg/u6AVRt7Bgm)",fetchReply:true});
    }
    new util.Command({name: "discord",description: "Join our discord server",dm_permission: true},discord);
    //getCoins
    async function getCoins(interaction){
        const coins = util.User.getUser(interaction.options.getUser("member"))?.getCoins(util.Guild.getGuild(interaction.guild.id)) ?? 0;
        let response = `@silent <@${interaction.options.getUser("member")}> has ${coins} coins`
        interaction.reply({content: response, fetchReply: true});
    }
    new util.Command({name: "getCoins".toLowerCase(),description: "get a users coin balance",dm_permission: false,options:[{name: "member", type: 6, description: "member to get the coins of", required: true}]},getCoins);
    //giveCoins
    //coinLeaderboard
    //auraLeaderboard
    //buyCoins
    //changeServerSetting
    //serverSettings
    //changeShopSetting
    //shopSettings
    //addShopItem
    //removeShopItem
    //buyShopItem
    //serverBooster
    //changeServerBooster
    //restartBot
    //ramUsage
    async function getRamUsage(interaction){
        response = `Heap Used: ${Math.ceil((process.memoryUsage().heapUsed/104857600)*100)} % | ${Math.ceil((process.memoryUsage().heapUsed/1024/1024))} MB`
        await interaction.reply({content: response, fetchReply: true});
    }
    new util.Command({name: "getRam".toLowerCase(),description: "Get the current ram usage",dm_permission: true},getRamUsage);
    //runCode
    //getInvites
    client.once('ready', async () => {
        util.msg(`Logged in as ${client.user.tag}! commands.js`);
    });
    client.login(JSONConfig.token);
} catch (error){
    console.error("A fatal error occured in file commands.js",error);
}