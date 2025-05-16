try{
    //if u need help with a certain function please contact the person who created it. 
    // it should show the author of each function above the function
    const { AttachmentBuilder, Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const util = require("./utilities.js");
    const fs = require("fs");
    const JSONConfig = require("./config.json");
    const {createHash} = require('crypto');
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ]
    });
    async function underConstruction(interaction){
        await interaction.reply({content: "command under construction", fetchReply : true, allowedMentions: {parse: []}});
    }

    //rizzme
    /**
     * Sends a random pickup line
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */
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
        await interaction.reply({content: response, fetchReply: true , allowedMentions: {parse: []}});
    }
    new util.Command({name: 'rizzme',description: 'Receive a random pickup line!',integration_types: [0, 1], contexts: [0, 1, 2] },rizzme);
    //oil
    /**
     * Sends a message that the user has been oiled
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */
    async function oil(interaction){
        // Get the user from the command options
        const target = interaction.options.getUser("user");
        const oiler = interaction.user;


        // Create the response with proper mentions and IDs
        const response = `<@${oiler.id}> oiled up <@${target.id}>`;

        // Send the reply
        await interaction.reply({ content: response, fetchReply: true , allowedMentions: {parse: []}});

    }
    new util.Command({name: "oil",/*oil me up brosquito*/description: "oil up your friends",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: 'user',type: 6, description: 'Choose a user to oil up',required: true}]},oil);
    //authors
    /**
     * Displays the author of the bot.
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */
    async function authors(interaction){
        const response = "the authors of <@1305713838775210015> \n **Founder**: <@790709753138905129> \n **Developer**: <@799101657647415337>,<@1005413712536023100>\n **Admin**:<@1307191266525839481>,<@1215373521463681147>,<@1248851515901481095>";
        await interaction.reply({content: response, fetchReply: true});
    }
    new util.Command({name: "authors",description: "Get the authors of this bot",integration_types: [0, 1], contexts: [0, 1, 2] },authors);
    //announce
    /**
     * Sends an announcement to server admins
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */
    async function announce(interaction){
        const announcementFile = interaction.options.getString("message")
        const announcementMessage = fs.readFileSync(`./${announcementFile}`,"utf-8");
        const communityServer = await client.guilds.fetch("1310772622044168275");
        const member = await communityServer.members.fetch(interaction.user.id);
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)){
            await interaction.reply({content: "invalid password", fetchReply: true});
            return false
        }
        try {
            await interaction.reply({content: "Sending announcement...", fetchReply: true, ephemeral: false});
            let successCount = 0;
            let failCount = 0;
            for (const guild of client.guilds.cache.values()){
                try {
                    const owner = await guild.fetchOwner();
                    await owner.send(announcementMessage);
                    await util.msg(`Message sent to ${owner.user.tag} in ${guild.name}`);
                    successCount++;
                    
                    } catch (error) {
                        await util.msg(`Failed to message the owner of ${guild.name} error: ${error}`);
                        failCount++;
                    }
                }
                await interaction.followUp({content:`Announcement sent! Success: ${successCount} Failed: ${failCount}`, ephemeral: false})
        } catch (error) {
            await util.msg(`error sending announcements, ${error}`)
        }
    }
    new util.Command({name: "announce",description: "Send a dm to server owners",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: "message",type: 3,description: "Message file to send",required: true}]},announce);
    //getAura
    /**
     * sends the aura of the given user
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function getAura(interaction){
        const user = interaction.options.getUser("member")
        if (user === undefined || user === null) user = interaction.user;
        const CalculatedAura = Math.floor(util.User.getUser(user.id)?.aura ?? 0);
        const response = `<@${user.id}> has ${CalculatedAura} aura and has a sigma level of ${util.User.getUser(user.id)?.level ?? 0}`;
        await interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "getAura".toLowerCase(),description: "display a users aura",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: "member",type: 6,description: "User to get aura of",required: true}]},getAura);
    //diddle
    /**
     * Allows users to diddle other users
     * Function Created by houdert6
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */
    async function diddle(interaction){
        // Get the user from the command options
        const target = interaction.options.getUser("user");

        if (!target) {
            return await interaction.reply({ content: "You need to mention someone to diddle!", fetchReply: true, ephemeral: true });
        }

        // Create the response with proper mention and ID
        const response = `<@${target.id}> has been diddled`;

        // Send the reply
        await interaction.reply({ content: response, fetchReply: true , allowedMentions: {parse: []}});

    }
    new util.Command({name: "diddle",description: "Diddle your friends",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: 'user',type: 6,description: 'Choose a user to diddle',required: true}]},diddle);
    //addShopItem
    /**
     * add a shop to the guilds shop
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function addShopItem(interaction){
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).shop.addShopItem(interaction.options.getString("type"),interaction.options.getString("id"),interaction.options.getNumber("coins"));
            await interaction.reply({content:`Added ${interaction.options.getString("type")} with id ${interaction.options.getString("id")} to shop for ${interaction.options.getNumber("coins")} coins`, fetchReply: true, allowedMentions: {parse: []}})
        } else {
            await interaction.reply({content: "You do not have permission to run this command", fetchReply: true, allowedMentions: {parse: []}})
        }
    }
    new util.Command({name: "addShopItem".toLowerCase(),description: "add a item to your servers shop",dm_permission: false,options: [{name: "type",type: 3,description: "channel or role",required: true},{name: "id",type: 3,description: "id of channel or role",required: true},{name: "coins",type: 10,description: "price of shop item",required: true}]},addShopItem);
    //removeShopItem
    /**
     * removes a shop from the guilds shop
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function removeShopItem(interaction){
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).shop.removeShopItem(interaction.options.getString("type"),interaction.options.getString("id"));
            await interaction.reply({content:`Removed ${interaction.options.getString("type")} with id ${interaction.options.getString("id")} from shop`, fetchReply: true, allowedMentions: {parse: []}})
        } else {
            await interaction.reply({content: "You do not have permission to run this command", fetchReply: true, allowedMentions: {parse: []}})
        }
    }
    new util.Command({name: "removeShopItem".toLowerCase(),description: "remove a item from your shop",dm_permission: false,options: [{name: "type",type: 3,description: "channel or role",required: true},{name: "id",type: 3,description: "id of channel ore role",required: true}]},removeShopItem);
    //buyShopItem
    /**
     * gives user an item from shop
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function buyShopItem(interaction){
        const guild = util.Guild.getGuild(interaction.guild.id);
        const shopItem = util.Guild.getGuild(interaction.guild.id).shop.items.filter(item => item["type"] === interaction.options.getString("type") && item["itemInfo"] === interaction.options.getString("id"))[0];
        const response = await guild.shop.buyShopItem(shopItem,util.Guild.getGuild(interaction.guild.id),util.User.getUser(interaction.user.id))

        await interaction.reply({content: response,fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "buyShopItem".toLowerCase(),description: "buy a item from shop",dm_permission: false,options: [{name: "type",type: 3,description: "channel or role",required: true},{name: "id",type: 3,description: "channel/role to buy",required: true}]},buyShopItem);
    //shop
    /**
     * displays the servers shop
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function shop(interaction){
        const response = util.Guild.getGuild(interaction.guild.id).shop.showShop();
        await interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}})
    }
    new util.Command({name:"shop",description: "list the items you can buy",dm_permission: false},shop);
    //giveAura
    /**
     * give aura to user on discord
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function giveAura(interaction){
        let message;
        const target = interaction.options.getUser("user");
        const auraAmount = interaction.options.getNumber("aura");
        const communityServer = await client.guilds.fetch("1310772622044168275");
        const member = await communityServer.members.fetch(interaction.user.id);
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.User.getUser(interaction.user.id).giveAura(auraAmount,false);
            message = `<@${target.id}> has been given ${auraAmount} aura by <@${interaction.user.id}>`;
        } else {
            message = `invalid password`;
        }
        await interaction.reply({content: message, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name:"giveAura".toLowerCase(),description: "give aura to a user (bot admins only)",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: "user",type:6,description: "user to give aura to",required:true},{name: "aura",type: 10,description: "amount of aura to give",required: true}]},giveAura);
    //discord
    /**
     * sends and invite link to the diddy bot server
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function discord(interaction){
        await interaction.reply({content: "Join our diddy-bot community  [discord server](https://discord.gg/u6AVRt7Bgm)",fetchReply:true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "discord",description: "Join our discord server",integration_types: [0, 1], contexts: [0, 1, 2]},discord);
    //getCoins
    /**
     * sends the coins of the given user
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function getCoins(interaction){
        const coins = util.User.getUser(interaction.options.getUser("member").id)?.getCoins(util.Guild.getGuild(interaction.guild.id)) ?? 0;
        let response = `${interaction.options.getUser("member")} has ${coins} coins`
        await interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "getCoins".toLowerCase(),description: "get a users coin balance",dm_permission: false,options:[{name: "member", type: 6, description: "member to get the coins of", required: true}]},getCoins);
    //giveCoins
    /**
     * gives Coins to the given user through discord
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function giveCoins(interaction){
        let response;
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.User.getUser(interaction.options.getUser("user").id).giveCoins(interaction.options.getNumber("coins"),util.Guild.getGuild(interaction.guild.id));
            response = `gave ${interaction.options.getNumber("coins")} coins to ${interaction.options.getUser("user")}`;
        } else {
            response = `invalid permissions`;
        }
        await interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name:"giveCoins".toLowerCase(),description: "give coins to a user",dm_permission: false,options: [{name: "user",type:6,description: "user to give aura to",required:true},{name: "coins",type: 10,description: "amount of aura to give",required: true}]},giveCoins);
    //coinLeaderboard
    /**
     * sends the server coin leaderboard
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function coinBoard(interaction){
        await interaction.reply({content: util.Guild.getGuild(interaction.guild.id).leaderboard(),fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "coinLeaderBoard".toLowerCase(),description: "leaderboard for coins", dm_permission : false},coinBoard)
    //auraLeaderboard
    /**
     * sends the global aura leaderboard
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function auraBoard(interaction){
        await interaction.reply({content: util.User.leaderboard(),fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "auraLeaderboard".toLowerCase(),description: "Show the global aura leaderboard",integration_types: [0, 1], contexts: [0, 1, 2]},auraBoard);
    //buyCoins
    /**
     * gives coins to the given user
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function buycoins(interaction){
        interaction.reply({content: util.Guild.getGuild(interaction.guild.id).shop.buyCoins(interaction.options.getNumber("amount"),util.Guild.getGuild(interaction.guild.id),util.User.getUser(interaction.user.id)), fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name:"buyCoins".toLowerCase(),description:"buy coins with aura if server has enabled",dm_permission: false, options: [{name: "amount",type: 10, description: "amount of coins to buy", required: true}]},buycoins);
    //ShowServerSettings
    /**
     * display the current server settings
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function ShowServerSettings(interaction){
        response = util.Guild.getGuild(interaction.guild.id).showSettings();
        interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "showServerSettings".toLowerCase(),description: "show the settings of the server"},ShowServerSettings);
    //changeServerSettings
    /**
     * change the settings of the server
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function changeServerSettings(interaction){
        setting =  interaction.options.getString("setting");
        value  = interaction.options.getString("value");
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).changeSetting(setting,value);
            interaction.reply({content: `changed setting ${setting} to ${value}`,fetchReply: true});
        } else {
            interaction.reply({content: "you do not have permission to run this command",fetchReply: true});
        }
        
    }
    new util.Command({name: "changeServerSettings".toLowerCase(),description: "change the settings of the server",options: [{name:"setting",description: "settings to change",type: 3, required: true}, {name:"value",description: "value to change it to", type: 3, required: true}]},changeServerSettings)
    //showShopSettings
    /**
     * show the shop settings
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function showShopSettings(interaction){
        response = util.Guild.getGuild(interaction.guild.id).shop.showSettings();
        interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "showShopSettings".toLowerCase(),description: "show the settings of the servers shop"},showShopSettings);
    //changeShopSettings
    /**
     * change the settings of the server
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function changeShopSettings(interaction){
        setting =  interaction.options.getString("setting");
        value  = interaction.options.getString("value");
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).shop.changeSetting(setting,value,true)
            interaction.reply({content: `changed setting ${setting} to ${value}`,fetchReply: true});
        } else {
            interaction.reply({content: "you do not have permission to run this command",fetchReply: true});
        }
        
    }
    new util.Command({name: "changeShopSettings".toLowerCase(),description: "change the settings of the server shop",options: [{name:"setting",description: "settings to change",type: 3, required: true}, {name:"value",description: "value to change it to", type: 3, required: true}]},changeShopSettings)
    //withdraw
    /**
     * withdraw aura from shop bank
     * function create by unprankable
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function withdraw(interaction){
        amount = interaction.options.getNumber("amount");
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            let shop = util.Guild.getGuild(interaction.guild.id).shop;
            if (amount <= shop.balance){
                shop.balance -= amount;
                util.User.getUser(interaction.user.id).giveAura(amount,false);
                interaction.reply({content: `withdrew ${amount} from shop bank`,fetchReply: true});
            } else {
                interaction.reply({content: `shop bank only has ${shop.balance} aura`,fetchReply: true});
            }
        } else {
            interaction.reply({content: `invalid permissions`,fetchReply: true});
        }
    }
    new util.Command({name: "withdraw", description: "withdraw aura from shop bank", options: [{name: "amount",description: "amount to withdraw",type: 10, required: true}]},withdraw);
    //getServerBooster
    /**
     * retrieve the current server booster
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function getServerBooster(interaction){
        await interaction.reply({content: `${util.Guild.getGuild(interaction.guild.id).booster}`,fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "getServerBooster".toLowerCase(),description: "get the current booster for the server",dm_permission: false},getServerBooster);
    //changeServerBooster
    /**
     * change the current server booster
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function changeServerBooster(interaction){
        let response;
        if (interaction.member.roles.cache.has(util.Guild.getGuild(interaction.guild.id).shop.config.shopAdminRole) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.Guild.getGuild(interaction.guild.id).booster = interaction.options.getNumber("newBooster".toLowerCase());
            response = `set server booster to ${interaction.options.getNumber("newBooster".toLowerCase())}`
        } else {
            response = `invalid permissions`;
        }
        await interaction.reply({content: response, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "changeServerBooster".toLowerCase(),description: "change the server booster",dm_permission: false,options: [{name:"newBooster".toLowerCase(),type: 10, description: "new booster for coins on server",required: true}]},changeServerBooster);
    //getInvite
    /**
     * sends an invite to a random server
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function getInvite(interaction) {
        let invites = [];
    
        client.guilds.cache.forEach(guild => {
            const guildData = util.Guild.getGuild(guild.id);
            console.log(guildData);
            if (guildData && guildData.settings) {
                if (guildData.settings["randomInviteEnabled"]) {
                    const inviteCode = guildData.settings["invite-code"];
                    if (inviteCode && inviteCode !== "") {
                        invites.push(inviteCode);
                    }
                }
            }
        });
    
        if (invites.length > 0) {
            const randomIndex = Math.floor(Math.random() * invites.length);
            const randomInvite = invites[randomIndex];
            await interaction.reply({ content: `https://discord.gg/${randomInvite} | [${invites.join(", ")}] | ${randomIndex}`, fetchReply: true });
        } else {
            await interaction.reply({ content: "Couldn't find a valid server invite.", fetchReply: true });
        }
    }

    new util.Command({name: "getRandomInvite".toLowerCase(),description: "join a random server that has advertising enabled",integration_types: [0, 1], contexts: [0, 1, 2]},getInvite);
    //rizzlers
    /**
    * show the current rizzlers and pickupline form
    * function created by unprankable
    * @param {Interaction} interaction The interaction passed by the client
    * @returns {Promise<void>}
    */
    async function rizzlers(interaction){
        interaction.reply({content: "@unprankable01\n@houdert6\n@owcapl_\n@royalknight0\n@nexuscageoil\n@buldakislovebuldakislife\n@def_not_vexx\n@chi56567899\nContribute a pickupline to be added :)\n[Diddy Bot Pickup Lines - FORM](https://docs.google.com/forms/d/e/1FAIpQLSdLM2-i72__bdf2ht9xthyhhXMqATBbaS7ZCX5M9BiahkeJ6Q/viewform?usp=dialog)",fetchReply: true,allowedMentions: {parse: []}});
    }
    new util.Command({name: "rizzlers",description: "people who contributed pickup-lines",integration_types: [0, 1], contexts: [0, 1, 2]},rizzlers);
    client.once('ready', async () => {
        await util.msg(`Logged in as ${client.user.tag}! commands.js`);
    });
    //echo
    /**
     * echo a message
     * function created by unprankable
     * @param {Interaction} interaction The interaction passed by the client
     * @returns {Promise<void>}
     */
    async function echo(interaction){
        const channelId = interaction.channel ? interaction.channel.id : 'DM';
        const serverId = interaction.guild ? interaction.guild.id : 'DM';
        const userMessage = interaction.options.getString('message');
        if (!(channelId == "DM") && !(serverId == "DM")){//in a server
            const server = await client.guilds.fetch(serverId);
            const member = await server.members.fetch(interaction.user.id);
            if (member.permissions.has(PermissionsBitField.Flags.Administrator)){
                util.msg(userMessage + `\nMessage Sent by: <@${interaction.user.id}> using echo`,interaction.guild.id,interaction.channel.id);
                await interaction.reply({content: `message sent!!` ,ephemeral: true, fetchReply: false});
            } else {
                await interaction.reply({content: "invalid perms", ephemeral: true, fetchReply: false})
            }
        } else {// in a DM
            await interaction.reply({content: "message sent!!" ,ephemeral: true, fetchReply: false});
            await interaction.followUp({content: userMessage + `\nMessage Sent by: <@${interaction.user.id}> using echo`,ephemeral: false, allowedMentions: {parse: []}});
        }
    }
    new util.Command({name:"echo", description: "echo a message (for bot admins)", options: [{name: 'message', type: 3, description: 'The message you want me to say back to you', required: true}], integration_types: [0, 1], contexts: [0, 1, 2]},echo);
    //dm
    /**
     * send a message to user
     * function created by unprankable
     * @param {Interaction} interaction The interaction passed by the client
     * @returns {Promise<void>}
     */
    async function dm(interaction){
        const communityServer = await client.guilds.fetch("1310772622044168275");
        const member = await communityServer.members.fetch(interaction.user.id);
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)){
            util.sendDM(interaction.options.getString('message'),interaction.options.getString('id'));
            await interaction.reply({content: "Direct Message Sent!!",fetchReply: true, ephemeral: true});
        } else {
            await interaction.reply({content: "this command can only be run by bot admins",fetchReply: true, ephemeral: true});
        }
    }
    new util.Command({name:"dm", description: "Send a message to a user as Diddy (for bot admins)", options: [{name: "id", type: 3, description: "users user id", required: true}, {name: "message", type: 3, description: "message to send user", required: true}], integration_types: [0, 1], contexts: [0, 1, 2]},dm);
    //gamble
    /**
     * gamble your aura.
     * function created by unprankable.inspired by (discord:@royalknight0)
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function gamble(interaction){
        let amount = interaction.options.getNumber("amount");
        let user = util.User.getUser(interaction.user.id)
        let hasAura = amount <= user.aura;
        if (hasAura){
            let percent = Math.floor(Math.random()*101)/100;
            let win = Math.floor(Math.random()*2);
            let result;
            if (win == 1){
                result = Math.floor(amount*percent);
                user.giveAura(interaction.user.id,result);
                interaction.reply({content: `You gained ${result} aura`,fetchReply:true});
            } else {
                result = Math.floor(-1*(amount*percent));
                user.giveAura(interaction.user.id,result);
                interaction.reply({content: `You lost ${(-1*(result))} aura`, fetchReply: true});
            }
        } else {
            interaction.reply({content: `you only have ${aura.calculateAura(interaction.user.id)} aura`,fetchReply: true});
        }
    }
    new util.Command({name: "gamble", description: "gamble your money", options: [{name: "amount", description: "how much to gamble", type: 10, required: true}], integration_types: [0, 1], contexts: [0, 1, 2]},gamble);
    //getFile
    /**
     * Retrieve a file if your a bot admin
     * function created by unprankable
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function getFile(interaction) {
        const communityServer = await client.guilds.fetch("1310772622044168275");
        const member = await communityServer.members.fetch(interaction.user.id);
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)){
                const file = new AttachmentBuilder(interaction.options.getString("path"));
                await interaction.reply({content: `file: ${interaction.options.getString("path")}`, fetchReply: true, ephemeral: true, files: [file]});
        } else {
            await interaction.reply({content: "you do not have permission to run this command",fetchReply: true});
        }
    }
    new util.Command({name: "getFile".toLowerCase(), description: "retrieve a file (bot admins only)", options: [{name: "path",description: "path to file",type: 3,required: true}],integration_types: [0, 1],contexts: [0, 1, 2]},getFile)
    client.login(JSONConfig.token);
} catch (error){
    console.error("A fatal error occured in file commands.js",error);
}
