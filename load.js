const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const util = require("./utilities.js");
const JSONConfig = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ] // Ensure the necessary intents are enabled
});
client.once('ready', async () => {
    await util.msg(`Logged in as ${client.user.tag}! load.js`);
    await util.loadData();//load current data
    let servers = 0;
    for (const guild of client.guilds.cache.values()) {//loop thru every server so we can register everyone that is not registered yet
        servers++;
        let guildExists = util.Guild.exists(guild.id);
        if(!guildExists)util.Guild.register(guild.id,guild.name);
        console.log(`${servers}.${guild.name} has ${guild.memberCount} members`);//list the amount of members each server has
        let allMembers;
        try{//atempt to retrieve all member ig lol
            allMembers = await guild.members.fetch({time: 5000});
        } catch(error){
            console.log(`unable to retrieve member list for guild ${guild.name}:${guild.id}`);
            continue;
        }
        let count = 0;
        for (const member of allMembers.values()) {//loop thru every user so we can register anyone who isn't registered yet
            if (member.user.bot)continue;
            count++;
            if (count % 100 === 0) console.log(`Processed ${count} users in ${guild.name} ${Math.floor((count/guild.memberCount)*100)}%`);
            let userExists = util.User.exists(member.user.id);
            if(userExists)continue;
            if(!userExists)util.User.register(member.user.id,member.user.tag,{[member.guild.id]:0});
            //if(!util.Guild.getGuild(member.guild.id).hasUser(member.user.id))util.Guild.getGuild(member.guild.id).addUser({"user":util.User.getUser(member.user.id),"coins":0});
            let guildHasUser = await util.Guild.getGuild(member.guild.id).hasUser(member.user.id);
            let userData = {"user":util.User.getUser(member.user.id),"coins": 0};//add user if he isn't in server
            if(!guildHasUser)await util.Guild.getGuild(member.guild.id).addUser(userData);
        };
    };
    await util.msg("loaded all guilds and users");

});
client.login(JSONConfig.token)
