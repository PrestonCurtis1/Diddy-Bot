const { ShardingManager, REST, Routes } = require('discord.js');
const JSONConfig = require('./config.json');
const util = require('./utilities.js');
const api = require('./api.js');
const commands = require("./commands.js");
(async () => {
    try {
        // Register global application commands once from the master process
        const rest = new REST({ version: '10', timeout: 60000 }).setToken(JSONConfig.token);
        await util.msg('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(JSONConfig.clientId), {
            body: util.Command.commands,
        });
        await util.msg('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands in master:', error);
    }

    // Start API once from the master process
    try {
        api.runApi();
    } catch (e) {
        console.error('Failed to start API from master:', e);
    }

    // Spawn shards
    try {
        const manager = new ShardingManager('./bot.js', {
            token: JSONConfig.token,
            totalShards: 4,
        });

        manager.on('shardCreate', shard => {
            console.log(`Launched shard ${shard.id}`);
        });

        // spawn all shards
        manager.spawn();
    } catch (err) {
        console.error('Failed to spawn shards:', err);
    }
    util.loadData();

})();
// index.js is the sharding master only. All worker logic lives in `bot.js`.
