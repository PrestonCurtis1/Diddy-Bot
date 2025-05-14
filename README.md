# How to install Diddy-Bot
***
# Install the official Diddy-Bot
We have gotten the bot verified and are currently working on getting message content intents
- First open the `Discord Desktop App`
- Open the *__App Directory__* in `User Settings`
- Search for *__Diddy__*
- If you don't see *__Diddy Bot__* Then `Scroll Down`
- Once you have located *__Diddy Bot__* Click `Add App`
- You can choose to `Add to Server` Or `Add to apps`
If you are unable to add *__Diddy Bot__* to your `Server` You will need to create a custom version
Instructions for Creating a custom version of the bot are below
# Use a custom Diddy-Bot
- First in install *__[Git](https://git-scm.com/downloads/)__*
- Then install *__[Node](https://nodejs.org/en/download/)__*
- You can choose to use the Beta Bot or the Main Bot
- for the *__Beta Bot__* Run `git clone -b beta https://github.com/PrestonCurtis1/Diddy-Bot.git`
- for the *__Main Bot__* Run `git clone -b master https://github.com/PrestonCurtis1/Diddy-Bot.git`
- Go to the Discord Developer Portal
- Create a new bot
- Enable *__`Server Members`__* an *__`Message Content`__* Intents
- Create a 3 files `data.json`, `oldData.json`and, `config.json`
- For `oldData.json` and `data.json` set the contents to `{}`
- Then create a password and encrypt it with [sha256](https://tools.keycdn.com/sha256-online-generator)
- grab your bot-token, clientId and encyrptedpassword and put it in config.json
- install dependencies with `npm install`
- run the bot with `node index.js`
***
Your `config.json` file should look like this
```json
{
	"token": "BOT-TOKEN-HERE",
	"clientId": "CLIENTID-HERE",
	"botAdminPassword": "ENCRYPTED-PASSWORD-HERE"
}
```
***
If you encounter any *__Errors__* or *__Problems__* You can join the  [Diddy Bot Community](https://discord.com/invite/u6AVRt7Bgm) Discord Server for support
