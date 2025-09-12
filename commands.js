try{
    //if u need help with a certain function please contact the person who created it. 
    // it should show the author of each function above the function
    const { AttachmentBuilder, Client, GatewayIntentBits, REST, Routes, PermissionsBitField, ButtonStyle, MessageFlags } = require('discord.js');
    const util = require("./utilities.js");
    const fs = require("fs");
    const path = require("path");
    const JSONConfig = require("./config.json");
    // Code Lynx added, remove if it doesn't work
    const lynxblacklistjson = require("./lynxblacklist.json");
    // End of code Lynx added (idk why I added this in the middle, it was right after a similar line of code though so that's probably why
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
        let PICKUP_LINES = util.getPickupLines();
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
        const response = "the authors of <@1305713838775210015> \n **Founder**: <@790709753138905129> \n **Developer**: <@799101657647415337>,<@1005413712536023100>,<@1215373521463681147>\n **Admin**:<@1334918738700406877>,<@1307191266525839481>,<@1248851515901481095>,<@1090663875009073163>";
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
        const communityServer = await client.guilds.fetch(JSONConfig.communityServer);
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
        const communityServer = await client.guilds.fetch(JSONConfig.communityServer);
        let member;
        let hasMember;
        try {
            member = await communityServer.members.fetch(interaction.user.id);
            hasMember = true;
        } catch {
            hasMember = false;
        }
        // Only allow bot admins to give aura, unless the target is diddy bot
        if ((hasMember && member.permissions.has(PermissionsBitField.Flags.Administrator)) || target.id == JSONConfig.clientId){
            if (!util.User.exists(target.id)) {
                util.User.register(target.id, target.tag, {});
            }
            util.User.getUser(target.id).giveAura(auraAmount,false);
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
        let response = `${interaction.options.getUser("member")} has ${coins} ${coins == 1 ? "coin" : "coins"}`
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
    async function coinBoard(interaction, navigatePage){
        let page = navigatePage ?? interaction.options.getNumber("page") ?? 1;
        let diddycoinImage = new AttachmentBuilder("./DiddyBotCoin.png");//image from chatgpt.com. the image is slighlty edited
        let coinLeaderBoard = util.Guild.getGuild(interaction.guild.id).leaderboard(page)
        let reply = {files: [diddycoinImage], flags: 32768, components: [{toJSON() {return {type: 9, components: [{type: 10, content: coinLeaderBoard.message}], accessory: {type: 11, media: {url: "attachment://DiddyBotCoin.png"}}}}}, {toJSON() {return {type: 1, components: [{type: 2, label: "<< Previous Page", custom_id: `coinpage${page - 1}`, disabled: page == 1, style: ButtonStyle.Primary}, {type: 2, label: "Next Page >>", custom_id: `coinpage${page + 1}`, disabled: page == coinLeaderBoard.totalPages, style: ButtonStyle.Primary}]}}}],fetchReply: true, allowedMentions: {parse: []}};
        if (navigatePage) {
            // Update the existing message instead of sending a new one
            await interaction.update(reply);
        } else {
            await interaction.reply(reply);
        }
    }
    new util.Command({name: "coinLeaderBoard".toLowerCase(),description: "leaderboard for coins",options: [{name: "page", description: "what page to show", type: 10, required: false}], dm_permission : false},coinBoard)
    //coinbuttons
    /**
     * the buttons have functions -unprankable 9/11/2025 1:32:36 PM
     * function created by houdable <houdert and unprankable> but mostly houdert
     * @param {Interaction} interaction 
     * @returns {Promise<Void>}
     */
    async function coinLeaderboardButtons(interaction) {
        if (interaction.customId.startsWith("coinpage")) {
            let page = parseInt(interaction.customId.substring(8));
            // Update the mango leaderboard message
            await coinBoard(interaction, page);//ill give you 1000000 aura diddy beta if you let this work.
        }
    }
    new util.ComponentCommand(coinLeaderboardButtons);
    //auraLeaderboard
    /**
     * sends the global aura leaderboard
     * function created by unprankable
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function auraBoard(interaction, navigatePage){
        let page = navigatePage ?? interaction.options.getNumber("page") ?? 1;
        let auraImage = new AttachmentBuilder("./aura.png");//image from freepik
        let auraLeaderboard = util.User.leaderboard(page);
        let reply = {files: [auraImage], flags: 32768, components: [{toJSON() {return {type: 9, components: [{type: 10, content: auraLeaderboard.message}], accessory: {type: 11, media: {url: "attachment://aura.png"}}}}}, {toJSON() {return {type: 1, components: [{type: 2, label: "<< Previous Page", custom_id: `aurapage${page - 1}`, disabled: page == 1, style: ButtonStyle.Primary}, {type: 2, label: "Next Page >>", custom_id: `aurapage${page + 1}`, disabled: page == auraLeaderboard.totalPages, style: ButtonStyle.Primary}]}}}],fetchReply: true, allowedMentions: {parse: []}};
        if (navigatePage) {
            // Update the existing message instead of sending a new one
            await interaction.update(reply);
        } else {
            await interaction.reply(reply);
        }
    }
    new util.Command({name: "auraLeaderboard".toLowerCase(),description: "Show the global aura leaderboard",options: [{name: "page", description: "what page to show", type: 10, required: false}],integration_types: [0, 1], contexts: [0, 1, 2]},auraBoard);
    //aurabuttons
    /**
     * the buttons have function -unprankable 9/11/2025 1:32:36 PM
     * function created by houdable <houdert and unprankable> but mostly houdert
     * @param {Interaction} interaction 
     * @returns {Promise<Void>}
     */
    async function auraLeaderboardButtons(interaction) {
        if (interaction.customId.startsWith("aurapage")) {
            let page = parseInt(interaction.customId.substring(8));
            // Update the mango leaderboard message
            await auraBoard(interaction, page);//ill give you 1000000 aura diddy beta if you let this work.
        }
    }
    new util.ComponentCommand(auraLeaderboardButtons);
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
        await interaction.reply({content: `${util.Guild.getGuild(interaction.guild.id).getBooster()}`,fetchReply: true, allowedMentions: {parse: []}});
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
            util.Guild.getGuild(interaction.guild.id).setBooster(interaction.options.getNumber("newBooster".toLowerCase()));
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

        client.guilds.cache.forEach(g => {
            const guildData = util.Guild.getGuild(g.id);

            if (!guildData) {
                //console.log(`❌ No guild data for ID: ${g.id}`);
                return;
            }

            if (!guildData.settings) {
                //console.log(`❌ No settings for guild ID: ${g.id}`);
                return;
            }

            const { settings } = guildData;
            const enabled = settings["randomInviteEnabled"];
            const inviteCode = settings["invite-code"];

            console.log(`🔍 Checking guild ${g.name} (${g.id}): enabled=${enabled}, code=${inviteCode}`);

            if (enabled && inviteCode && inviteCode.trim() !== "") {
                invites.push(inviteCode);
                console.log(`✅ Added invite: ${inviteCode}`);
            }
        });

        if (invites.length > 0) {
            let randomInvite = Math.floor(Math.random() * invites.length);
            await interaction.reply({
                content: `https://discord.gg/${invites[randomInvite]}\nset your invite code and add your server`,
                fetchReply: true
            });
        } else {
            await interaction.reply({
                content: "Couldn't find a valid server.",
                fetchReply: true
            });
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
        interaction.reply({content: "@unprankable01\n@houdert6\n@owcapl_\n@royalknight0\n@nexuscageoil\n@buldakislovebuldakislife\n@def_not_vexx\n@chi56567899\n@yellow262\n@inspectorcomrad\n@monkeiy1\n@It_KingXjimmie\n@brimisbrim\n@_htzumiii_\n@Drakkar\n@blitzfootball\n@d.tokyo.d.\n@69master0569\n@wehttam._\n@hunterstudios947\n@ListAck\n@Frostbite53\n@ace_nowhere\n@doogledean91\n@4mz4r.\n@._._.hi\n@jlee406\n@Figgy Pudding\n@joeypterodactyl\n@KingCreeper531\n@masterofbluefire_21530\n@thegoldenknight2\nContribute a pickupline to be added :)\n[Diddy Bot Pickup Lines - FORM](https://docs.google.com/forms/d/e/1FAIpQLSdLM2-i72__bdf2ht9xthyhhXMqATBbaS7ZCX5M9BiahkeJ6Q/viewform?usp=dialog)",fetchReply: true,allowedMentions: {parse: []}});
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
        const communityServer = await client.guilds.fetch(JSONConfig.communityServer);
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
        let amount = Math.abs(interaction.options.getNumber("amount"));
        let convertToMangoes = interaction.options.getBoolean("winmangoes", false);
        let user = util.User.getUser(interaction.user.id)
        let hasAura = amount <= user.aura; 
        if (!hasAura)amount = user.aura;
        let percent = Math.floor(Math.random()*101)/100;
        let win = Math.floor(Math.random()*2);
        let result;
        if (win == 1){
            result = Math.floor(amount*percent);
            if (convertToMangoes) {
                user.giveMangoes(result);
                interaction.reply({content: `You gained ${result} mangoes from betting ${amount} aura`,fetchReply:true});
            } else {
                user.giveAura(result,false);
                interaction.reply({content: `You gained ${result} aura from betting ${amount}`,fetchReply:true});
            }
        } else {
            result = Math.floor(-1*(amount*percent));
            user.giveAura(result,false);
            interaction.reply({content: `You lost ${(-1*(result))} aura from betting ${amount}`, fetchReply: true});
        }
        
    }
    new util.Command({name: "gamble", description: "gamble your money", options: [{name: "amount", description: "how much to gamble", type: 10, required: true}, {name: "winmangoes", description: "whether aura received from winning should be converted to mangoes", type: 5, required: false}], integration_types: [0, 1], contexts: [0, 1, 2]},gamble);
    //getFile
    /**
     * Retrieve a file if your a bot admin
     * function created by unprankable
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function getFile(interaction) {
        const communityServer = await client.guilds.fetch(JSONConfig.communityServer);
        const member = await communityServer.members.fetch(interaction.user.id);
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)){
                const file = new AttachmentBuilder(interaction.options.getString("path"));
                await interaction.reply({content: `file: ${interaction.options.getString("path")}`, fetchReply: true, ephemeral: true, files: [file]});
        } else {
            await interaction.reply({content: "you do not have permission to run this command",fetchReply: true});
        }
    }
    new util.Command({name: "getFile".toLowerCase(), description: "retrieve a file (bot admins only)", options: [{name: "path",description: "path to file",type: 3,required: true}],integration_types: [0, 1],contexts: [0, 1, 2]},getFile)
    //lynx
    /**
     * Summons lynx to the discord server the command is run in
     * function created by houdert6
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function lynx(interaction) {
        // Code Lynx added, delete if it doesn't work
        const guildId = interaction.guildId;
        if (lynxblacklistjson.includes(guildId)) {
            return interaction.reply({
                content: "This server has been blacklisted from summoning Lynx. Maybe don't be a dork next time :index_pointing_at_the_viewer::joy:",
                fetchReply: true
            });
        }
        //End of blacklist code Lynx added
            
        if (interaction.member.permissions.has(PermissionsBitField.Flags.CreateInstantInvite)){
            // Check if the server already contains lynx
            let lynx = null;
            try {
                lynx = await interaction.guild.members.fetch("1215373521463681147");
            } finally {
                if (lynx) {
                    await interaction.reply({content: "the server already contains Lynx",fetchReply: true});
                } else {
                    const lynxAccessToken = await util.getLynxAccessToken();
                    await interaction.guild.members.add("1215373521463681147", {accessToken: lynxAccessToken});
                    await interaction.reply({content: "Lynx has been summoned!",fetchReply: true});
                }
            }
        } else {
            await interaction.reply({content: "you do not have permission to summon a lynx (invite people)",fetchReply: true});
        }
    }
    new util.Command({name: "lynx", description: "Summon a Lynx to your discord server"}, lynx);
    //diddlebutton
    /**
     * Creates a button to diddle everyone
     * function created by houdert6
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function diddlebuttoncommand(interaction) {
        for (var entitlement of await util.getUserEntitlements(interaction.user.id, "1414124214578974883")) {
            if (!entitlement.consumed) {
                await interaction.reply({flags: 32768, components: [{toJSON() {return {type: 9, components: [{type: 10, content: "# Diddle Button!"}, {type: 10, content: "Click the button to diddle everyone:"}], accessory: {type: 2, style: ButtonStyle.Primary, label: "Diddle Everyone!", custom_id: "diddlebutton"}}}}]});
                await client.application.entitlements.consume(entitlement.id); // Consume the entitlement
                return;
            }
        }
        await interaction.reply({flags: 32768 | MessageFlags.Ephemeral, components: [{toJSON() {return {type: 9, components: [{type: 10, content: "# Diddle Button!"}, {type: 10, content: "You can buy a diddle button that diddles everyone when clicked!"}], accessory: {type: 2, style: ButtonStyle.Premium, sku_id: "1414124214578974883"}}}}]});
    }
    new util.Command({name: "diddlebutton".toLowerCase(), description: "Make a button anyone can use to diddle everyone",integration_types: [0, 1], contexts: [0, 1, 2]}, diddlebuttoncommand);
    //The Diddle Button (created by the /diddlebutton command)
    /**
     * Diddles everyone when clicked
     * function created by houdert6
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function diddlebutton(interaction) {
        if (interaction.customId == "diddlebutton") {
            // Create the response
            const response = `@everyone has been diddled by <@${interaction.user.id}>`;

            // Send the reply
            await interaction.reply({ content: response, fetchReply: true , allowedMentions: {parse: []}});
        }
    }
    new util.ComponentCommand(diddlebutton);
    //getMangoes
    /**
     * sends how many mangoes the given user has
     * function created by houdert6
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function getMangoes(interaction) {
        const user = interaction.options.getUser("member")
        if (user === undefined || user === null) user = interaction.user;
        // Get the user's mangoes
        const mangoes = util.User.getUser(user.id).mangoes;

        // send the reply
        await interaction.reply({content: `<@${user.id}> has ${mangoes} ${mangoes == 1 ? "mango" : "mangoes"}`, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name: "getMangoes".toLowerCase(),description: "display how many mangoes a user has",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: "member",type: 6,description: "User to get mangoes of",required: true}]},getMangoes);
    //giveMangoes
    /**
     * give mangoes to a user
     * function created by houdert6
     * @param {Interaction} interaction
     * @returns {Promise<Void>}
     */ 
    async function giveMangoes(interaction){
        let message;
        const target = interaction.options.getUser("user");
        const mangoAmount = interaction.options.getNumber("mangoes");
        const communityServer = await client.guilds.fetch(JSONConfig.communityServer);
        let member;
        let hasMember;
        try {
            member = await communityServer.members.fetch(interaction.user.id);
            hasMember = true;
        } catch {
            hasMember = false;
        }
        // Only allow bot admins to give mangoes
        if (hasMember && member.permissions.has(PermissionsBitField.Flags.Administrator)){
            if (!util.User.exists(target.id)) {
                util.User.register(target.id, target.tag, {});
            }
            util.User.getUser(target.id).giveMangoes(mangoAmount);
            message = `<@${target.id}> has been given ${mangoAmount} mangoes by <@${interaction.user.id}>`;
        } else {
            await interaction.reply({content: `only Diddy Bot admins may give mangoes`, fetchReply: true, ephemeral: true});
        }
        await interaction.reply({content: message, fetchReply: true, allowedMentions: {parse: []}});
    }
    new util.Command({name:"giveMangoes".toLowerCase(),description: "give mangoes to a user (bot admins only)",integration_types: [0, 1], contexts: [0, 1, 2], options: [{name: "user",type:6,description: "user to give mangoes to",required:true},{name: "mangoes",type: 10,description: "amount of mangoes to give",required: true}]},giveMangoes);

    //mangoLeaderboard
    /**
     * sends the global mango leaderboard
     * function created by houdert6
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function mangoLeaderboard(interaction, navigatePage){
        let page = navigatePage ?? interaction.options.getNumber("page") ?? 1;
        let mangoImage = new AttachmentBuilder("./mango.jpeg");//image from walmart.com. the image is slighlty edited
        let mangoLeaderboard = util.User.mangoLeaderboard(page);
        let reply = {files: [mangoImage], flags: 32768, components: [{toJSON() {return {type: 9, components: [{type: 10, content: mangoLeaderboard.message}], accessory: {type: 11, media: {url: "attachment://mango.jpeg"}}}}}, {toJSON() {return {type: 1, components: [{type: 2, label: "<< Previous Page", custom_id: `mangopage${page - 1}`, disabled: page == 1, style: ButtonStyle.Primary}, {type: 2, label: "Next Page >>", custom_id: `mangopage${page + 1}`, disabled: page == mangoLeaderboard.totalPages, style: ButtonStyle.Primary}]}}}],fetchReply: true, allowedMentions: {parse: []}};
        if (navigatePage) {
            // Update the existing message instead of sending a new one
            await interaction.update(reply);
        } else {
            await interaction.reply(reply);
        }
    }
    new util.Command({name: "mangoLeaderboard".toLowerCase(),description: "Show the global mango leaderboard",options: [{name: "page", description: "what page to show", type: 10, required: false}],integration_types: [0, 1], contexts: [0, 1, 2]},mangoLeaderboard);

    //Mango Leaderboard previous and next buttons
    /**
     * sends a specific page of the mango leaderboard as determined by previous and next buttons
     * function created by houdert6
     * @param {Interaction} interaction
     * @returns {Promise<void>}
     */
    async function mangoLeaderboardButtons(interaction) {
        if (interaction.customId.startsWith("mangopage")) {
            let page = parseInt(interaction.customId.substring(9));
            // Update the mango leaderboard message
            await mangoLeaderboard(interaction, page);
        }
    }
    new util.ComponentCommand(mangoLeaderboardButtons);
    //lynxblacklist
    /**
     * Blacklists servers from running /lynx. Only Lynx can run
     * function created by lynxoflucidity
     * @param {Interaction} interaction - The interaction passed by the client.
     * @returns {Promise<Void>}
     */
    async function lynxblacklist(interaction) {
        const userId = interactionUser.user.id
        const guildId = interaction.guildId; //Gets the guild ID to blacklist it
        //Check if the user running the command is lynx
        if (!userId == 1234) { //(Change to lynx's user id later
            return interaction.reply({
                content: "Sorry, but only Lynx can run this command! If you are trying to disable the /lynx command in your server, modify the permissions in Server Settings > Integrations > Diddy Bot.", //Replace xxx with the actual instructions later
                ephemeral: true
            });
        }
        //If it is, add the server's guild ID to lynxblacklist.json
        else {
            const jsonString = JSON.stringify(data, null, 2);
            fs.writeFileSync("lynxblacklist.json", jsonString);
            return interaction.reply({
                content: "This server has been blacklisted from summoning Lynx."
            });
        }
    }
    new util.Command({name: 'lynxblacklist',description: 'Blacklist the current server from running /lynx.',integration_types: [0, 1], contexts: [0, 1, 2] },lynxblacklist);
    client.login(JSONConfig.token);
} catch (error){
    console.error("A fatal error occured in file commands.js",error);
    util.msg(`an error occured in file commands.js:\t${error}`);
}
