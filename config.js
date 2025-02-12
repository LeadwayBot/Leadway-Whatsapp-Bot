// config.js
require('dotenv').config();

module.exports = {
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN,
    whatsappPhoneNumber: process.env.WHATSAPP_PHONE_NUMBER,
};
