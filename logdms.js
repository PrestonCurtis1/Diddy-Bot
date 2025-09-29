const { Client, GatewayIntentBits, Partials } = require("discord.js");
const JSONConfig = require("./config.json");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel] // Needed to receive DMs
});

const USER_IDS = ["799101657647415337","790709753138905129"]; // replace with your Discord ID

client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // ignore bot messages

    // DM check
    if (message.channel.type === 1) { // 1 = DM
        try {
            for (ID = 0; ID < USER_IDS.length; ID++){
                const user = await client.users.fetch(USER_IDS[ID]);
                await user.send(`📩 DM from **${message.author.tag}**: ${message.content}`);
            }
        } catch (err) {
            console.error("Failed to forward DM:", err);
        }
    }
});

client.login(JSONConfig.token);
