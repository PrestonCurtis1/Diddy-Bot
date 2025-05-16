try{
    const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json');
    const pm2 = require('pm2');
    const path = require ("path");
    const fs = require("fs");
    class Guild {
        static all = {};
        constructor(id,name,booster,settings,shop){
            this.id = id;
            this.name = name;
            this.booster = booster;
            this.settings = settings;//about features invite-link randomInviteEnabled
            this.users = {};
            this.shop = new Shop(shop.id,shop.items,shop.balance,shop.config);
            Guild.all[id] = this;
        }
        hasUser(id){
            return (this.users[id]);
        }
        static exists(id){
            return (Guild.all[id]);
        }
        static register(guildId,guildName){
            new Guild(guildId,guildName,1,{"about":"","features":[],"invite-code":"","randomInviteEnabled":false},{"id":guildId,"items":[],"balance":0,"config":{"buyCoinCost":20,"buyCoins":"true","shopAdminRole":""}});
            saveData();
            return Guild.exists(guildId);
        }
        static getGuild(id){
            return Guild.all[id];
        }
        addUser(userData){
            //{"user":this,"coins":guilds[serverId]}
            if (!this.users[userData.user.id]){//user isn't already added to guild
                this.users[userData.user.id] = {"user":userData.user,"coins":userData.coins};
                if(userData.user.inGuild(this.id)){
                    userData.user.guilds[this.id] = userData.coins;
                }     
            }
            saveData();
        }
        showSettings(){
            let message = `Settings for ${this.name}\n`;
            for (const key in this.settings){
                message += `${key}\t|\t${this.settings[key]}\n`
            }
            return message
        }
        changeSetting(setting,value){ 
            if (setting == "randomInviteEnabled"){
                if (value.toLowerCase() == "true"){
                    value = true
                } else {
                    value = false;
                }
            }
            if (setting == "features"){
                value = value.split(",")
            }
            this.settings[setting] = value;
            saveData();
        }
        display(){
            console.log("|\tGUILD CLASS\t|\n",this);
        }
        leaderboard(){
            let message = `Server leaderboard for ${this.name}\n`;
            let userCoinList = [];
            for (const key in this.users){
                userCoinList.push({"name":this.users[key].user.name,"coins":this.users[key].coins});
            }
            userCoinList.sort((a, b) => b.coins - a.coins);
            userCoinList.forEach(({name,coins}) => {
                message += `@${name} :\t${coins} coins\n`;
            });
            return message;
        }  
    }
    class User {//const futureDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000); // Add hours in milliseconds
        static all = {};
        constructor(id,tag,aura,boosters,guilds){//for guilds use {"server_id_one": 10,"server_id_two":10}
            this.id = id;//string
            this.name = tag;//string
            this.aura = aura;//int
            this.level = Math.floor((this.aura/2)**(1/2.25));
            this.boosters = boosters;//object
            this.serverMulti = {};
            this.guilds = guilds;
            User.all[id] = this;
            for (const serverId in guilds){
                Guild.getGuild(serverId).addUser({"user":this,"coins":guilds[serverId]});
            };
        }
        static exists(id){
            return id in this.all;
        }
        static register(userId,userTag,guilds={}){
            msg(`registering user ${userTag}`);
            new User(userId,userTag,0,{"temp":{"multi":0,"endTime": new Date()},"perm":0},guilds);
            saveData();
            return User.exists(userId);
        }
        inGuild(id){
            return (this.guilds[id]);
        }
        static getUser(id){
            return User.all[id];
        }
        getAuraMultiplier(){
            return (1 + this.boosters.temp.multi + this.boosters.perm + (this.level/20));
        }
        giveAura(amount,applyMulti=true){
            const oldLevel = this.level
            switch(applyMulti){
                case true:
                    this.aura += Math.floor(amount*this.getAuraMultiplier());
                    break
                case false:
                    this.aura += Math.floor(amount);
                    break
            }
            this.level = Math.floor((this.aura/2)**(1/2.25));
            if (oldLevel !== this.level){
                return `${this.name} is now level ${this.level}`
            }
            saveData();
            return `no new level for ${this.name}`
            
        }
        pay(reciever,guild,amount){
            if (this.getCoins(guild) < amount){
                saveData();
                return false;
            } else{
                this.giveCoins(-1*amount,guild);
                reciever.giveCoins(amount,guild);
                saveData();
                return true
            }
        }
        giveCoins(amount,guild){
            if(guild.hasUser(this.id)){
                guild.addUser({"user":this,"coins":amount});
            }
            guild.users[this.id].coins += Math.floor(amount);
            this.guilds[guild.id] += Math.floor(amount);
            saveData();
        }
        getCoins(guild){
            return guild.users[this.id].coins;
        }
        static leaderboard(){
            let message = `Global aura leaderboard\n`;
            let userAuraList = [];
            for (const key in User.all){
                userAuraList.push({"name":User.all[key].name,"aura":User.all[key].aura});
            }
            userAuraList.sort((a, b) => b.aura - a.aura);
            userAuraList.forEach(({name,aura}) => {
                message += `@${name} :\t${aura} aura\n`;
            });
            return message;
        }
        display(){
            console.log("|\tUSER CLASS\t|\n",this);
        }
    }
    class Shop {
        static all = {}; 
        constructor(id,items,balance,config){
            this.id = id;
            this.items = items;//roles channels 
            this.balance = balance;
            this.config = config;//buyCoinCost, buyCoins, shopAdminRole
            Shop.all[id] = this;
        }
        display(){
            console.log("|\tSHOP CLASS\t|\n",this);
        }
        addShopItem(type,info,price){
            this.items.push({"type":type,"itemInfo":info,"price":price})
            saveData();
        }
        removeShopItem(type,info){
            this.items = this.items.filter(item => (!(item["itemInfo"] === info && item["type"] === type)));
            saveData();
        }
        async buyShopItem(shopItem,guild,user){
            let message;
            if (!this.items.includes(shopItem)){//item doesn't exist
                await msg(`item ${shopItem} not found in shop`);
                message = "item not in shop"
            } else {//item exists
                if (user.getCoins(guild) < shopItem.price){//invalid funds
                    await msg(`invalid funds to buy ${shopItem} in ${guild} for ${user.name} user has balance:${user.getCoins(Guild.getGuild(guild.id))}`);
                    message = "invalid funds"
                } else {//sufficient funds
                    saveData();
                    switch(shopItem.type){//valid types role channel
                        case "role":
                            if (!(await userHasRole(client,this.id,user.id,shopItem.itemInfo))){
                                await addRole(user.id,this.id,shopItem.itemInfo);
                                if (await userHasRole(client,this.id,user.id,shopItem.itemInfo)){
                                    message = `bought role with id ${shopItem.itemInfo} for ${shopItem.price}`;
                                    user.giveCoins(-1*shopItem.price,guild);
                                    break
                                } else {
                                    message = "an error occured applying the role";
                                    break
                                }
                            } else {
                                message = "you already have that role"
                                break
                            }
                        case "channel":
                            if (!(await userHasChannel(user.id,this.id,shopItem.itemInfo))){
                                await addChannel(user.id,this.id,shopItem.itemInfo);
                                if(await userHasChannel(user.id,this.id,shopItem.itemInfo)){
                                    message = `bought channel with id ${shopItem.itemInfo} for ${shopItem.price}`;
                                    user.giveCoins(-1*shopItem.price,guild);
                                    break
                                } else {
                                    message = "an error occured giving the channel";
                                    break
                                }
                            } else {
                                message = "you already have that channel"
                                break
                            }
                        default:
                            message = "invalid type";
                            break
                    }
                    
                }   
            }
            return message
        }
        buyCoins(amount,guild,user){
            if (!this.config.buyCoins){
                return `buying coins with aura is disabled in this server`;
            } else {
                let price = amount * this.config.buyCoinCost;
                if (typeof price === 'string') {
                    price = parseInt(value, 10);
                }
                if (price > user.aura){
                    return `insufficient funds ${amount} coins costs ${price} aura you only have ${user.aura} aura`;
                } else {
                    user.giveAura((-1*price),false);
                    this.balance += price;
                    user.giveCoins(amount,guild);
                    saveData();
                    return `payment of ${amount} coins for ${price} aura successful`
                }
            }
        }
        showSettings(){//nonprivate fix by adding getName
            let message = `Settings for ${Guild.getGuild(this.id).name} shop\n`;
            for (const key in this.config){
                message += `${key}\t|\t${this.config[key]}\n`
            }
            return message
        }
        changeSetting(setting,value,allowed){ 
            if (allowed){//if user has shop admin role
                if (setting == "buyCoinCost"){
                    value = parseInt(value,10);
                } else if (setting == "buyCoins"){
                    if(value.toLowerCase() == "true"){
                        value = true;
                    } else{
                        value = false;
                    }
                }  
                this.config[setting] = value;
            } else {
                return `you must have <@&${this.config.shopAdminRole}> or have admin perms to edit config `
            }
            saveData();
        }
        showShop(){
            let message = `Shop items for ${Guild.getGuild(this.id).name}\n`;
            message += `**Bank**: ${this.balance}:\tAura\n`
            this.items.forEach(({type, itemInfo, price}) => {
                switch (type){
                    case "role":
                        message += `${type}:\t<@&${itemInfo}>|\t${itemInfo};\t${price} coins\n`
                        break
                    case "channel":
                        message += `${type}:\t<#${itemInfo}>|\t${itemInfo};\t${price} coins\n`
                        break
                }     
            });
            if(this.config.buyCoins){
                message += `coins:\t${"`/buyCoins amount`"}|\t${this.config.buyCoinCost}*amount\n`;
            }
            return message;
        }
        withdraw(amount,user,allowed){
            if (!allowed){
                return `you are not permitted to use this command`
            } else {
                if (this.balance < amount) {
                    return `shop has insufficient funds: ${this.balance} < ${amount}`;
                } else {
                    user.giveAura(amount,false);
                    this.balance -= amount;
                }
            }
            saveData();
        }
    }
    class Command {
        static commands = [];
        static all = {};
        constructor(command,run){
            this.command = command;
            this.run = run;
            Command.commands.push(command);
            Command.all[command.name] = this;
        }
        async runCommand(interaction){
            await this.run(interaction);
        }
        static getCommand(name){
            return Command.all[name];
        }
        display(){
            console.log("|\tCOMMAND CLASS\t|\n",this);
        }
    }

    function saveData(){
        let guilds = [];
        for (const id in Guild.all){
            let guild = Guild.all[id];
            guildObject = {
                "id": guild.id,
                "name": guild.name,
                "booster": guild.booster,
                "settings": guild.settings,
                "shop": {
                    "id": guild.shop.id,
                    "items": guild.shop.items,
                    "balance": guild.shop.balance,
                    "config": guild.shop.config
                }
            }
            guilds.push(guildObject);
        }
        let users = [];
        for (const id in User.all){
            let user = User.all[id];
            userObject = {
                "id": user.id,
                "tag": user.name,
                "aura": user.aura,
                "boosters": user.boosters,
                "guilds": user.guilds
            }
            users.push(userObject);
        }
        let data = {
            "guilds":guilds,
            "users":users,
        }
        fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), 'utf-8');
    }
    async function loadData(){
        if (fs.existsSync("./data.json")) {
            const data = JSON.parse(fs.readFileSync("./data.json", 'utf-8'));
            for (const guild in data.guilds){
                new Guild(data.guilds[guild].id,data.guilds[guild].name,data.guilds[guild].booster,data.guilds[guild].settings,data.guilds[guild].shop);
            }
            for (const user in data.users){
                new User(data.users[user].id,data.users[user].tag,data.users[user].aura,data.users[user].boosters,data.users[user].guilds);
            }
            await msg("Loaded Data");
        }; // Return an empty object if the file doesn't exist
    }
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMessages, 
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ] // Ensure the necessary intents are enabled
    });

    // Function to send a message to a specific channel in a specific server
    async function msg(logMessage,guildId="1310772622044168275", channelId="1310982567398342737") {
        try {
            // Fetch the guild using its ID
            const guild = await client.guilds.fetch(guildId);
            
            // Fetch the channel using its ID
            const channel = await guild.channels.fetch(channelId);

            // Check if the channel is text-based and send the message
            if (channel.isTextBased()) {
                //use console.log instead of msg in this function because other-wise it will loop infinitely
                await channel.send({content:`${logMessage}`, allowedMentions: {parse: []}});
                console.log(`Message sent to ${channel.name} in guild ${guild.name}: ${logMessage}`);
            } else {
                console.log('The specified channel is not a text channel.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    async function sendDM(content,userId) {
        //const userId = '790709753138905129';//unprankable
        //const userId = '1273153837699563565';//chibubbles
        //const userId = '799101657647415337';//houdert6
        try {
            const user = await client.users.fetch(userId);
            await user.send(content);
            sendMessage(`DM sent to ${user.name}: ${content}`);
        } catch (err) {
            sendMessage(`Failed to send DM to ${user.name}: ${err.message}`);
        }
    }
    async function userHasRole(client, guildId, userId, roleId) {
        try {
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            return member.roles.cache.has(roleId);
        } catch (err) {
            msg(`Failed to fetch member: ${err}`);
            return false;
        }
    }

    async function addRole(userId,guildId, roleId){
        try {
            const guild = await client.guilds.fetch(guildId);
            if (!guild) {
                throw new Error('Guild not found.');
            }
            const member = await guild.members.fetch(userId);
            if (!member) {
                throw new Error('User not found in the guild.');
            }
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                throw new Error('Role not found in the guild.');
            }
            await member.roles.add(role);
            await msg(`Added role ${role.name} to user ${member.user.tag}.`);
        } catch (error) {
            await msg(`Failed to add role: ${error.message}`);
        }
    }
    async function addChannel(userId,guildId,channelId){
        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const member = await guild.members.fetch(userId);
            await channel.permissionOverwrites.edit(member, {
                [PermissionsBitField.Flags.ViewChannel]: true,  // Allow the user to view the channel
                [PermissionsBitField.Flags.SendMessages]: true,  // Allow the user to send messages
            });
            await msg(`Permissions set for ${member.user.tag} in ${channel.name}.for server ${guild.name}`);
        } catch (error) {
            msg('Error assigning permissions:', error);
        }
    }
    async function userHasChannel(userId, guildId, channelId) {
        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const member = await channel.guild.members.fetch(userId);
            const permissions = channel.permissionsFor(member);

            return permissions.has(['ViewChannel', 'SendMessages']);
        } catch (err) {
            msg(`Failed to check permissions: ${err}`);
            return false;
        }
    }
    async function migrateShop(shopId){//shop id just use the guild id
        if(fs.existsSync("./shop.json")){
            let oldShops;
            try{
                oldShops = JSON.parse(fs.readFileSync("./shop.json","utf-8"));
            } catch(error){
                await msg("error reading file \"./shop.json\"",error);
            }
            let oldShop
            if(shopId in oldShops){
                oldShop = oldShops[shopId]
            } else {
                oldShop = [];
            }
            let GuildShop = Guild.getGuild(shopId).shop
            for (let shop of oldShop){
                GuildShop.addShopItem("role",shop["roleId"],shop["price"]);
            }
            oldShops[shopId] = [];
            saveData();
            try{
                fs.writeFileSync("./shop.json", JSON.stringify(oldShops,null,2), 'utf-8');
            } catch(error){
                await msg("error saving file",error);
            }
        }
    }
    async function migrateUser(userId){
        if (fs.existsSync("./oldData.json")){
            let oldData;
            try {
                oldData = JSON.parse(fs.readFileSync("./oldData.json", 'utf-8'));
            } catch(error){
                await msg("error reading file \"./oldData.json\"",error);
            }
            let oldAura;
            oldAura = oldData[userId]?.[0] ?? 0;
            oldData[userId] = [0,0];
            User.getUser(userId).giveAura(oldAura,false);
            saveData();
            try{
                fs.writeFileSync("./oldData.json", JSON.stringify(oldData, null, 2), 'utf-8');
            } catch(error){
                await msg("error saving file",error);
            }
        }
    }
    
    /**
     * add a shop to the guilds shop
     * function created by unprankable
     * @param {mem} userId - The interaction passed by the client.
     * @returns {Promise<Void>}
     */ 
    async function guildHasUser(Guild,User){
        guild.members.cache.has(userId);
        guild.members
    }
    client.once('ready', async () => {
        await msg(`Logged in as ${client.user.tag}! utilities.js`);
        await loadData();
        for (let guild in Guild.all){
            await migrateShop(guild);
        }
    });
    module.exports = {
        msg,
        saveData,
        loadData,
        addRole,
        migrateUser,
        sendDM,
        userHasRole,
        userHasChannel,
        addChannel,
        Guild,
        User,
        Shop,
        Command,
    }
    // setInterval(() => {saveData();msg("saved data YAY!!!");},60000);
    // Log in with your bot token
    
    client.login(JSONConfig.token);
} catch (error){
    console.error("A fatal error occured in file utilities.js",error);
}
