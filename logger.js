const fs = require('fs');

// Create or append to a log file
const logFile = './bot.log';

const logMessage = (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;

    // Append the message to the log file
    fs.appendFileSync(logFile, logEntry);
};

// Simple logging functions with emojis
const logger = {
    info: (message) => logMessage(`🤖 INFO: ${message}`),
    error: (message) => logMessage(`❌ ERROR: ${message}`)
};

module.exports = logger;
