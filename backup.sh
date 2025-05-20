#!/bin/bash

# Source file
SRC="/home/diddy/Diddy-Bot/data.json"

# Destination folder
DEST_DIR="/home/diddy/Diddy-Bot/backup"

# Make sure backup directory exists
mkdir -p "$DEST_DIR"

# Current timestamp
DATE=$(date +"%Y-%m-%d_%H-%M")

# Destination file name
DEST="$DEST_DIR/${DATE}-data.json"

# Copy the file
cp "$SRC" "$DEST"

