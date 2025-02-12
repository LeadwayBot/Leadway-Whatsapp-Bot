// bot.js
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config'); // Import config file

const client = new Client();

client.on('qr', (qr) => {
    // Generate and scan this QR code to log in
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    console.log('WhatsApp API Token:', config.whatsappApiToken); // Example of using the token
    console.log('WhatsApp Phone Number:', config.whatsappPhoneNumber); // Example of using the phone number
});

client.on('message', message => {
    console.log('Message received:', message.body);
});

client.initialize();
