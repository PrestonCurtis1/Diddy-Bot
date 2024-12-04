try {
    const fs = require('fs');
    const { Client, GatewayIntentBits, REST, Routes, PermissionsBitField } = require('discord.js');
    const JSONConfig = require('./config.json'); // Load the bot token and client ID from config.json
    const aura = require("./aura.js");
    const path = "./shop.json";
    const utilities = require("./utilities.js");
    let shopLists = loadShopLists();

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
    function loadShopLists() {
        if (fs.existsSync(path)) {
            const data = fs.readFileSync(path, 'utf-8');
            utilities.sendMessage("loaded shopLists");
            return JSON.parse(data); // Parse the JSON data into an object
        }
        return {}; // Return an empty object if the file doesn't exist
    }

    function saveShopLists() {
        fs.writeFileSync(path, JSON.stringify(shopLists, null, 2), 'utf-8'); // Save as JSON
        utilities.sendMessage("saved shopLists");
    }

    function addShopRole(admin, roleId, price, guildId){
        if (admin){
            if (!shopLists[guildId]) {
                shopLists[guildId] = []; // Create a new shop list for the server
            }
            shopLists[guildId].push({ "roleId": roleId.id, "price": price });;
            saveShopLists();
                return `role <@&${roleId.id}> added to shop with price ${price}`;
        } else{
            return `Admin permission are required in this server to run this command`;
        }
    }
    function removeShopRole(admin, roleId, guildId) {
        if (admin) {// Check if the shop list exists for the given guildId
            if (!shopLists[guildId] || !Array.isArray(shopLists[guildId])) {
                return `No shop roles found for this guild.`;
            } else {// Filter the roles to remove the specified roleId
                shopLists[guildId] = shopLists[guildId].filter(guildShop => guildShop["roleId"] !== roleId.id);// Check if the role was removed or didn't exist
                if (shopLists[guildId].length === 0 || !shopLists[guildId].some(guildShop => guildShop["roleId"] === roleId.id)) {
                    saveShopLists(); // Save the updated shop list
                    return `Role <@&${roleId.id}> removed from shop.`;
                } else {
                    return `Failed to remove role <@&${roleId.id}> from shop.`;
                }
            }
        } else {
            return `Admin permissions are required in this server to run this command.`;
        }
    }
    
    async function buyShopRole(roleId,userId,guildId){
        try{
            const totalAura = aura.calculateAura(userId);
            multiplier = aura.getMultiplier(userId);
            const price = shopLists[guildId].filter(role => role["roleId"] === roleId.id)[0]["price"];
            if (!shopLists[guildId].filter(role => role["roleId"] === roleId.id)[0]["roleId"]){
                return "Role not found in shop";
            } else{
                if (totalAura >= price){
                    const guild = await client.guilds.fetch(guildId);
                    const member = guild.members.cache.get(userId);
                    const role = guild.roles.cache.get(roleId.id);
                    await member.roles.add(role);
                    utilities.sendMessage(`${userId} bought role <@&${roleId.id}> for ${price} in ${guild.id}`);
                    const guildOwner = guild.ownerId;
                    utilities.sendMessage("om nom 1"+guildOwner);
                    // aura.giveAura(userId,-1*price);
                    // aura.giveAura(guildOwner,price);
                    aura.pay(userId,guildOwner,price/multiplier);
                    return `Bought role <@&${roleId.id}> for ${price} aura`;
                } else {
                    return `Insufficient Aura\nthe role <@&${roleId.id}> cost ${price} aura\nyou only have ${totalAura} aura`;
                }
            }
        } catch(error){
            console.error(`an error occured apply role shop.js line 100 buyshoprole function ${error}`,error);
            return "an error occured please make sure Diddy-bot has manage roles permissions"
        }
    }
    function listShopRoles(guildId,userId){
        let message = `Shop Roles for this server\n`;
        if (!shopLists[guildId]){
            shopLists[guildId] = [];
        }
        const roles = shopLists[guildId];
        for (let role = 0; role < roles.length; role++){
            utilities.sendMessage("userId"+userId);
            utilities.sendMessage("roles"+roles);
            utilities.sendMessage("roles[role]"+roles[role]);
            roleMessage = `role:\t<@&${roles[role]["roleId"]}>,\tprice:\t${Math.floor(roles[role]["price"])}\n`;
            message += roleMessage;
            
        }
        if (roles.length === 0){
            message += "This server has not Setup any shop roles";
        }
        return message;
    }
    client.once('ready', async () => {
        utilities.sendMessage(`Logged in as ${client.user.tag}! shop.js`);
    });
    module.exports = {
        loadShopLists,
        saveShopLists,
        addShopRole,
        removeShopRole,
        buyShopRole,
        listShopRoles,
    };
    client.login(JSONConfig.token);
    
} catch(error){
    utilities.sendMessage(`Error occured in shop.js ${error}`);
}