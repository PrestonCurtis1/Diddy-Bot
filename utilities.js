const { stringify } = require('querystring');

try{
    const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json');
    const path = require("path");
    const fsp = require("fs").promises;
    const fs = require("fs");

    let PICKUP_LINES;

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
        getName(){
            return this.name;
        }
        setName(name){
            this.name = name;
            saveData();
        }
        getBooster(){
            return this.booster;
        }
        setBooster(newBooster){
            this.booster = newBooster
            saveData();
        }
        hasUser(id){
            return (this.users[id]);
        }
        static exists(id){
            return id in this.all;
        }
        static register(guildId,guildName){
            msg(`registering guild ${guildName}`);
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
                if(!userData.user.inGuild(this.id)){
                    userData.user.guilds[this.id] = userData.coins;
                }     
            }
            saveData();
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
            saveData();
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
                message += `**${rank}.** @${user.getName()} — ${user.coins} coins\n`;
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
            new User(userId,userTag,100,{"temp":{"multi":0,"endTime": new Date()},"perm":0},guilds);
            saveData();
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
            saveData();
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
            this.level = Math.floor((this.getAura()/2)**(1/2.25));
            if (oldLevel !== this.level){
                return `${this.getName()} is now level ${this.level}`
            }
            saveData();
            return `no new level for ${this.getName()}`
            
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
        static leaderboard(page = 1) {
            const perPage = 10;
            const userAuraList = [];

            for (const key in User.all) {
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
                    await msg(`invalid funds to buy ${shopItem} in ${guild} for ${user.getName()} user has balance:${user.getCoins(Guild.getGuild(guild.id))}`);
                    message = "invalid funds"
                } else {//sufficient funds
                    saveData();
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
                    saveData();
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
            } else {
                return `you must have <@&${this.config.shopAdminRole}> or have admin perms to edit config `
            }
            saveData();
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
        if (Guild.all == {} || User.all == {})return;
        const data = {"guilds":Guild.all,"users":User.all};
        try {
            fs.writeFileSync("./tempData.json",JSON.stringify(data,null,2),'utf-8');
            fs.renameSync("./tempData.json","data.json");
        } catch(error){
            msg(`Error saving file data.json: ${error}`)
        }
        // let guilds = [];
        // for (const id in Guild.all){
        //     let guild = Guild.all[id];
        //     guildObject = {
        //         "id": guild.id,
        //         "name": guild.getName(),
        //         "booster": guild.booster,
        //         "settings": guild.settings,
        //         "shop": {
        //             "id": guild.shop.id,
        //             "items": guild.shop.items,
        //             "balance": guild.shop.balance,
        //             "config": guild.shop.config
        //         }
        //     }
        //     guilds.push(guildObject);
        // }
        // let users = [];
        // for (const id in User.all){
        //     let user = User.all[id];
        //     userObject = {
        //         "id": user.id,
        //         "tag": user.getName(),
        //         "aura": user.getAura(),
        //         "boosters": user.boosters,
        //         "guilds": user.guilds
        //     }
        //     users.push(userObject);
        // }
        // let data = {
        //     "guilds":guilds,
        //     "users":users,
        // }
        // fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), 'utf-8');
    }
    async function loadData(){
        let raw;
        try {
            raw = await fsp.readFile("./data.json","utf-8");
        } catch(error){
            await msg(`Error loading file data.json${error}`);
            process.exit();
        }
        const {guilds, users} = JSON.parse(raw);
        let guildArray = Object.values(guilds);
        let userArray = Object.values(users);
        let guildAmount = guildArray.length;
        let userAmount = userArray.length;
        await msg(`guildAmount:\t${guildAmount}`);
        await msg(`userAmount:\t${userAmount}`);
        Guild.all = {}
        User.all = {}
        let guildCount = 0;
        for (const guild of guildArray) {
            guildCount++;
            if(guildCount % 100 == 0)setImmediate(() => msg(`Loading Guilds:\t${Math.floor((guildCount / guildAmount) * 100)}%`));
            new Guild(
                guild.id,
                guild.name,
                guild.booster,
                guild.settings,
                guild.shop
            );
        }
        let userCount = 0;
        for (const user of userArray) {
            userCount++;
            if(userCount % 100 == 0)setImmediate(() => msg(`Loading Users:\t${Math.floor((userCount / userAmount) * 100)}%`));
            new User(
                user.id,
                user.name,
                user.aura,
                user.boosters,
                user.guilds
            );
        }
        try {
            const data = fs.readFileSync('./pickup_lines.txt', 'utf8');//the file containing all the pickuplines
            PICKUP_LINES = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
        } catch (error) {
            console.error("Error reading pickup_lines.txt:",error);
        }
        await msg(`Loaded ${Object.keys(Guild.all).length} Guilds and ${Object.keys(User.all).length} Users`);
        //msg("Loaded" + Object.keys(Guild.all).length + "guilds and" + Object.keys(User.all).length + "users.");
        // if (fs.existsSync("./data.json")) {
        //     const data = JSON.parse(fs.readFileSync("./data.json", 'utf-8'));
        //     for (const guild in data.guilds){
        //         new Guild(data.guilds[guild].id,data.guilds[guild].name,data.guilds[guild].booster,data.guilds[guild].settings,data.guilds[guild].shop);
        //     }
        //     for (const user in data.users){
        //         new User(data.users[user].id,data.users[user].tag,data.users[user].aura,data.users[user].boosters,data.users[user].guilds);
        //     }
        //     await msg("Loaded Data");
        // }; // Return an empty object if the file doesn't exist
    }
    process.on("SIGINT", () => {
        saveData();
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
    client.once('ready', async () => {
        await msg(`Logged in as ${client.user.tag}! utilities.js`);
        await loadData();
    });
    module.exports = {
        msg,
        saveData,
        loadData,
        addRole,
        sendDM,
        userHasRole,
        userHasChannel,
        addChannel,
        getPickupLines,
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
    msg(`an error occured in file utilities.js:\t${error}`);
}
