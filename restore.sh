#!/bin/bash

# Check if an argument was passed
if [ -z "$1" ]; then
  echo "Usage: $0 <arg>"
  exit 1
fi

# Define variables
ARG="$1"
SRC="/home/diddy/Diddy-Bot/backup/${ARG}-database.sqlite"
DEST="/home/diddy/Diddy-Bot/database.sqlite"

# Run the copy command with sudo
sudo cp "$SRC" "$DEST"

