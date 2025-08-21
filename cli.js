#!/usr/bin/env node
const util = require("./utilities.js");
// Collect command-line arguments as code
const code = process.argv.slice(2).join(" ");

if (!code) {
  console.log("Usage: runjs '<javascript code>'");
}

try {
  // Evaluate the code
  const result = eval(code);
  console.log(result);
} catch (err) {
  console.error("Error:", err.message);
}

