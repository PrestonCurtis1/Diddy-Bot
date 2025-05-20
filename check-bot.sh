#!/bin/bash

# Set your bot's main file
BOT_SCRIPT="index.js"
# Set the path to your bot directory
BOT_DIR="/home/diddy/Diddy-Bot"
# Set the command to run your bot (adjust if you're using something like pm2 or nodemon)
START_CMD="node $BOT_SCRIPT"

# Move to the bot directory
cd "$BOT_DIR" || exit 1

# Check if the bot is already running
if pgrep -f "$BOT_SCRIPT" > /dev/null; then
    echo "Bot is already running."
else
    echo "Bot is not running. Starting bot..."
    nohup $START_CMD > bot.log 2>&1 &
    echo "Bot started."
fi

