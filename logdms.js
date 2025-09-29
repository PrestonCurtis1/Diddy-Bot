const {ButtonStyle, AttachmentBuilder, Client, GatewayIntentBits, Partials } = require("discord.js");
const JSONConfig = require("./config.json");
const util = require("./utilities.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel] // Needed to receive DMs
});


client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // ignore bot messages

    // DM check
    if (message.channel.type === 1) { // 1 = DM
         // replace with your Discord ID        
        try {
            const USER_IDS = ["1305977915216756736","799101657647415337","790709753138905129"];
            for (ID = 0; ID < USER_IDS.length; ID++){
                const avatarURL = message.author.displayAvatarURL({ extension: "png", size: 512 });
                const userAvatar = new AttachmentBuilder(avatarURL, { name: "avatar.png" });
                const reply = {files: [userAvatar], flags: 32768, components: [{toJSON() {return {type: 9, components: [{type:10, content: `📩 DM from **${message.author.tag}**: ${message.content}`}], accessory: {type: 11, media: {url:"attachment://avatar.png"}}}}}, {toJSON() {return {type: 1, components: [{type: 2, label:"Reply", custom_id: `userdm${message.author.id}`,disabled: false, style: ButtonStyle.Primary}]}}}],fetchReply: true};
                await util.sendDM(reply,USER_IDS[ID]);
                message.react("✅");
            }
        } catch (err) {
            console.error("Failed to forward DM:", err);
        }
    }
});
client.on("interactionCreate", async (interaction) =>{
    if (interaction.isButton() && interaction.customId.startsWith("userdm")){
        try {
            let userId = interaction.customId.replace("userdm","");
            await interaction.showModal({custom_id: `userdmmodal${userId}`, title: "Send a Reply", components: [{ type: 1, components: [{ type: 4, custom_id: "replyText",style: 2, label: "Type your reply",placeholder: "Write something...",required: true}]}]});
        } catch (error){
            console.error("an error occured showing modal in logdms",error);
        }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("userdmmodal")) {
        try {//im putting a try catch around this fetch cuz these sometimes fail
            let userId = interaction.customId.replace("userdmmodal","");
            console.log("log",interaction.customId)
            const content = interaction.fields.getTextInputValue("replyText");
            console.log(userId,"|",userId.length,typeof userId,userId === "799101657647415337");
            // const avatarURL = interaction.user.displayAvatarURL({ extension: "png", size: 512 });
            // const userAvatar = new AttachmentBuilder(avatarURL, { name: "avatar.png" });
            // const reply = {files: [userAvatar], flags: 32768, components: [{toJSON() {return {type: 9, components: [{type:10, content: `📩 DM from **${interaction.user.tag}**: ${content}`}], accessory: {type: 11, media: {url:"attachment://avatar.png"}}}}}, {toJSON() {return {type: 1, components: [{type: 2, label:"Reply", custom_id: `userdm${interaction.user.id}`,disabled: false, style: ButtonStyle.Primary}]}}}],fetchReply: true};
            await interaction.reply({ content: `Sending message: ${content}`, ephemeral: true });
            try{
                eval(`util.sendDM(${content},userId)`);
            } catch(error){
                util.sendDM(content,userId);
            }
        } catch (error){
            console.error("error submitting modal logdms.js",error);
            return
        }   
    }
})

client.login(JSONConfig.token);
