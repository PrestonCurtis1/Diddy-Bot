const { stringify } = require('querystring');

try{
    const { Client, GatewayIntentBits, PermissionsBitField, Routes, makeURLSearchParams, DiscordAPIError } = require('discord.js');
    const JSONConfig = require('./config.json');
    const sqlite3 = require('sqlite3').verbose();
    const { promisify } = require('util');
    const path = require("path");
    const fsp = require("fs").promises;
    const fs = require("fs");
    const JSONLynx = require('./lynx.json');

    let PICKUP_LINES;
    let loadingData = true;
    const db = new sqlite3.Database('./database.sqlite');
    const runAsync = promisify(db.run).bind(db);
    const allAsync = promisify(db.all).bind(db);
    let lynxAccessToken;
    let lynxRefreshToken = JSONLynx.lynxRefreshToken;
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
        async update(key,value){
            if (loadingData)return;
            await runAsync(`UPDATE Guild SET ${key} = ? WHERE id = ?`, [value, this.id]);
        }
        getName(){
            return this.name;
        }
        setName(name){
            this.name = name;
            this.update("name",this.name);
        }
        getBooster(){
            return this.booster;
        }
        setBooster(newBooster){
            this.booster = newBooster
            this.update("booster",this.booster);
        }
        hasUser(id){
            return (this.users[id]);
        }
        static exists(id){
            return id in this.all;
        }
        static async register(guildId,guildName){
            if (loadingData)return;
            msg(`registering guild ${guildName}`);
            new Guild(guildId,guildName,1,{"about":"","features":[],"invite-code":"","randomInviteEnabled":true},{"id":guildId,"items":[],"balance":0,"config":{"buyCoinCost":20,"buyCoins":"true","shopAdminRole":""}});
            let g = {"id": guildId, "name": guildName, "booster" : 1, "settings": {"about":"","features":[],"invite-code":"","randomInviteEnabled":true},"shop": {"id":guildId,"items":[],"balance":0,"config":{"buyCoinCost":20,"buyCoins":"true","shopAdminRole":""}}};
            await runAsync(
                `INSERT OR REPLACE INTO Guild (id, name, booster, settings, shop_id) VALUES (?, ?, ?, ?, ?)`,
                [g.id, g.name, g.booster, JSON.stringify(g.settings), g.shop.id]
            );
            let shop = g.shop;
            await runAsync(
                `INSERT OR REPLACE INTO Shop (id, items, balance, config) VALUES (?, ?, ?, ?)`,
                [shop.id, JSON.stringify(shop.items), shop.balance, JSON.stringify(shop.config)]
            );
            return Guild.exists(guildId);
        }
        static getGuild(id){
            return Guild.all[id];
        }
        addUser(userData){
            //{"user":this,"coins":guilds[serverId]}
            if (!this.users[userData.user.id]){//user isn't already added to guild
                this.users[userData.user.id] = {"user":userData.user,"coins":userData.coins};
                if(!userData.user.inGuild(this.id)){
                    userData.user.guilds[this.id] = userData.coins;
                    userData.user.update("guilds",JSON.stringify(userData.user.guilds));
                }     
            }
        }
        showSettings(){
            let message = `Settings for ${this.getName()}\n`;
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
            this.update("settings",JSON.stringify(this.settings));
        }
        display(){
            console.log("|\tGUILD CLASS\t|\n",this);
        }
        leaderboard(page = 1) {
            const perPage = 10;
            const userCoinList = [];

            for (const key in this.users) {
                userCoinList.push({
                    name: this.users[key].user.getName(),
                    coins: this.users[key].coins
                });
            }

            userCoinList.sort((a, b) => b.coins - a.coins);

            const totalPages = Math.ceil(userCoinList.length / perPage);
            const pageIndex = Math.max(0, Math.min(page - 1, totalPages - 1)); // Clamp to valid range

            const start = pageIndex * perPage;
            const end = start + perPage;
            const pageUsers = userCoinList.slice(start, end);

            let message = `**Server Coin Leaderboard — Page ${pageIndex + 1}/${totalPages} for ${this.getName()}**\n`;

            pageUsers.forEach((user, index) => {
                const rank = start + index + 1;
                message += `**${rank}.** @${user.name} — ${user.coins} coins\n`;
            });

            if (userCoinList.length === 0) {
                message += `No players found.`;
            }

            return message;
        }
  
    }
    class User {//const futureDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000); // Add hours in milliseconds
        static all = {};
        constructor(id,tag,aura,boosters,guilds){//for guilds use {"server_id_one": 10,"server_id_two":10}
            this.id = id;//string
            this.name = tag;//string
            this.aura = aura;//int
            if (isNaN(this.aura)){
                this.aura = 0;
                this.update("aura", this.aura);
            }
            this.level = Math.floor((this.aura/2)**(1/2.25));
            this.boosters = boosters;//object
            this.serverMulti = {};
            this.guilds = guilds;
            User.all[id] = this;
            for (const serverId in guilds){
                Guild.getGuild(serverId).addUser({"user":this,"coins":guilds[serverId]});
            };
        }
        async update(key,value){
            if (loadingData)return;
            await runAsync(`UPDATE User SET ${key} = ? WHERE id = ?`, [value, this.id]);
        }
        static exists(id){
            return id in this.all;
        }
        static async register(userId,userTag,guilds={}){
            if (loadingData)return;
            msg(`registering user ${userTag}`);
            new User(userId,userTag,100,{"temp":{"multi":0,"endTime": new Date()},"perm":0},guilds);
            let user = {"id": userId, "name": userTag, "aura": 100, "boosters": {"temp":{"multi":0,"endTime": new Date()},"perm":0},"guilds":guilds}
            await runAsync(
                `INSERT OR REPLACE INTO User (id, name, aura, boosters, guilds) VALUES (?, ?, ?, ?, ?)`,
                [user.id, user.name, user.aura, JSON.stringify(user.boosters), JSON.stringify(user.guilds),]
            );
            return User.exists(userId);
        }
        inGuild(id){
            return id in this.guilds;
        }
        static getUser(id){
            return User.all[id];
        }
        getAuraMultiplier(){
            return (1 + this.boosters.temp.multi + this.boosters.perm + (this.level/20));
        }
        getName(){
            return this.name
        }
        setName(name){
            this.name = name;
            this.update("name",this.name);
        }
        getAura(){
            return this.aura;
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
            this.update("aura",this.aura);
            this.level = Math.floor((this.getAura()/2)**(1/2.25));
            if (oldLevel !== this.level){
                return `${this.getName()} is now level ${this.level}`
            }
            return `no new level for ${this.getName()}`
            
        }
        pay(reciever,guild,amount){
            if (this.getCoins(guild) < amount){
                return false;
            } else{
                this.giveCoins(-1*amount,guild);
                reciever.giveCoins(amount,guild);
                return true
            }
        }
        giveCoins(amount,guild){
            if(guild.hasUser(this.id)){
                guild.addUser({"user":this,"coins":amount});
            }
            guild.users[this.id].coins += Math.floor(amount);
            this.guilds[guild.id] += Math.floor(amount);
            this.update("guilds",JSON.stringify(this.guilds));
        }
        getCoins(guild){
            return guild.users[this.id].coins;
        }
        static leaderboard(page = 1) {
            const perPage = 10;
            const userAuraList = [];

            for (const key in User.all) {
                // Exclude diddy bot from the aura leaderboard
                if (key == JSONConfig.clientId) {
                    continue;
                }
                userAuraList.push({
                    name: User.all[key].getName(),
                    aura: User.all[key].getAura()
                });
            }

            userAuraList.sort((a, b) => b.aura - a.aura);

            const totalPages = Math.ceil(userAuraList.length / perPage);
            const pageIndex = Math.max(0, Math.min(page - 1, totalPages - 1)); // Clamp page

            const start = pageIndex * perPage;
            const end = start + perPage;
            const pageUsers = userAuraList.slice(start, end);

            let message = `**Global Aura Leaderboard — Page ${pageIndex + 1}/${totalPages}**\n`;

            pageUsers.forEach((user, index) => {
                const rank = start + index + 1;
                message += `**${rank}.** @${user.name} — ${user.aura} aura\n`;
            });

            if (userAuraList.length === 0) {
                message += `No players found.`;
            }

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
        async update(key,value){
            if (loadingData)return;
            await runAsync(`UPDATE Shop SET ${key} = ? WHERE id = ?`, [value, this.id]);
        }
        display(){
            console.log("|\tSHOP CLASS\t|\n",this);
        }
        addShopItem(type,info,price){
            this.items.push({"type":type,"itemInfo":info,"price":price})
            this.update("items",JSON.stringify(this.items));
        }
        removeShopItem(type,info){
            this.items = this.items.filter(item => (!(item["itemInfo"] === info && item["type"] === type)));
            this.update("items",JSON.stringify(this.items));
        }
        async buyShopItem(shopItem,guild,user){
            let message;
            if (!this.items.includes(shopItem)){//item doesn't exist
                await msg(`item ${shopItem} not found in shop`);
                message = "item not in shop"
            } else {//item exists
                if (user.getCoins(guild) < shopItem.price){//invalid funds
                    await msg(`invalid funds to buy ${shopItem} in ${guild} for ${user.getName()} user has balance:${user.getCoins(Guild.getGuild(guild.id))}`);
                    message = "invalid funds"
                } else {//sufficient funds
                    switch(shopItem.type){//valid types role channel
                        case "role":
                            if (!(await userHasRole(client,this.id,user.id,shopItem.itemInfo))){
                                await addRole(user.id,this.id,shopItem.itemInfo);
                                if (await userHasRole(client,this.id,user.id,shopItem.itemInfo)){
                                    message = `bought role with id ${shopItem.itemInfo} for ${shopItem.price} coins`;
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
                                    message = `bought channel with id ${shopItem.itemInfo} for ${shopItem.price} coins`;
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
                if (price > user.getAura()){
                    return `insufficient funds ${amount} coins costs ${price} aura you only have ${user.getAura()} aura`;
                } else {
                    user.giveAura((-1*price),false);
                    this.balance += price;
                    user.giveCoins(amount,guild);
                    return `payment of ${amount} coins for ${price} aura successful`
                }
            }
        }
        showSettings(){//nonprivate fix by adding getName
            let message = `Settings for ${Guild.getGuild(this.id).getName()} shop\n`;
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
                this.update("config",JSON.stringify(this.config));
            } else {
                return `you must have <@&${this.config.shopAdminRole}> or have admin perms to edit config `
            }
        }
        showShop(){
            let message = `Shop items for ${Guild.getGuild(this.id).getName()}\n`;
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
                    this.update("balance",this.balance);
                }
            }
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
    async function createTables() {
        await runAsync(`
            CREATE TABLE IF NOT EXISTS Shop (
            id TEXT PRIMARY KEY,
            items TEXT,
            balance INTEGER,
            config TEXT
            )
        `);
        console.log("shop table created");
        await runAsync(`
            CREATE TABLE IF NOT EXISTS Guild (
            id TEXT PRIMARY KEY,
            name TEXT,
            booster INTEGER,
            settings TEXT,
            shop_id TEXT,
            FOREIGN KEY(shop_id) REFERENCES Shop(id)
            )
        `);
        console.log("guild table created");
        await runAsync(`
            CREATE TABLE IF NOT EXISTS User (
            id TEXT PRIMARY KEY,
            name TEXT,
            aura INTEGER,
            boosters TEXT,
            guilds TEXT
            )
        `);
        console.log("user table created");
    }
    async function loadData() {
        loadingData = true;
        try {
            // Load guilds with their shops
            const guildRows = await allAsync(`
            SELECT g.id as guild_id, g.name, g.booster, g.settings,
                    s.id as shop_id, s.items, s.balance, s.config
            FROM Guild g
            LEFT JOIN Shop s ON g.shop_id = s.id
            `);

            for (const row of guildRows) {
            const shop = {
                id: row.shop_id,
                items: JSON.parse(row.items),
                balance: row.balance,
                config: JSON.parse(row.config),
            };

            new Guild(
                row.guild_id,
                row.name,
                row.booster,
                JSON.parse(row.settings),
                shop
            );
            }

            // Load users
            const userRows = await allAsync(`SELECT * FROM User`);
            console.log(userRows)
            for (const user of userRows) {
            new User(
                user.id,
                user.name,
                user.aura,
                JSON.parse(user.boosters),
                JSON.parse(user.guilds)
            );
            }

            await msg(
            `Loaded ${Object.keys(Guild.all).length} Guilds and ${Object.keys(User.all).length} Users`
            );
            loadingData = false;
        } catch (error) {
            msg(`Error loading data from database: ${error}`);
            process.exit();
        }
        try {
            const data = fs.readFileSync('./pickup_lines.txt', 'utf8');//the file containing all the pickuplines
            PICKUP_LINES = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
        } catch (error) {
            console.error("Error reading pickup_lines.txt:",error);
            process.exit();
        }
        msg("loaded data pickuplines")
    }
    process.on("SIGINT", () => {
        process.exit();
    })
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMessages, 
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildMembers
        ] // Ensure the necessary intents are enabled
    });

    // Function to send a message to a specific channel in a specific server
    async function msg(logMessage,guildId=JSONConfig.communityServer, channelId=JSONConfig.logChannel) {
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
            msg(`DM sent to ${user.name}: ${content}`);
        } catch (err) {
            msg(`Failed to send DM to ${user.name}: ${err.message}`);
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
    
    function getPickupLines() {
        return PICKUP_LINES;
    }

    async function getLynxAccessToken() {
        if (lynxAccessToken) {
            return lynxAccessToken;
        }
        const tokenResponse = await fetch("https://discord.com/api/" + Routes.oauth2TokenExchange(), {body: `grant_type=refresh_token&refresh_token=${lynxRefreshToken}`, method: "POST", headers:{'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa(JSONConfig.clientId + ":" + JSONConfig.clientSecret)}});
        if (tokenResponse.status > 400) {
            throw new TypeError("Error refreshing token: " + await tokenResponse.text() + " (" + tokenResponse.status + ")");
        }
        const resJson = JSON.parse(await tokenResponse.text());
        if (resJson.error) {
            throw new TypeError("Error refreshing token: " + await tokenResponse.text() + " (" + tokenResponse.status + ")");
        }
        console.log(JSON.stringify(resJson));
        const token = resJson.access_token;
        lynxAccessToken = token;
        lynxRefreshToken = resJson.refresh_token;
        fs.writeFileSync("./lynx.json", JSON.stringify({lynxRefreshToken: resJson.refresh_token}, null, 2), 'utf-8'); // Save new refresh token as JSON
        setTimeout(() => {
            lynxAccessToken = null;
        }, resJson.expires_in * 1000);
        return token;
    }
    client.once('ready', async () => {
        await msg(`Logged in as ${client.user.tag}! utilities.js`);
        await createTables();
        await loadData();
    });
    module.exports = {
        msg,
        addRole,
        sendDM,
        userHasRole,
        userHasChannel,
        addChannel,
        getPickupLines,
        getLynxAccessToken,
        Guild,
        User,
        Shop,
        Command,
        loadingData,
    }
    
    client.login(JSONConfig.token);
} catch (error){
    console.error("A fatal error occured in file utilities.js",error);
    msg(`an error occured in file utilities.js:\t${error}`);
}
