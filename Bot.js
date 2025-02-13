const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('./logger');
const fs = require('fs');
const { 
    img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, 
    img16, img17, img18, img19, img20, img21, img22, img23, img24, img25, img26, img27, img28, img29, img30,
    
    txt1, txt2, txt3, txt4, txt5, txt6, txt7, txt8, txt9, txt10, txt11, txt12, txt13, txt14, txt15, 
    txt16, txt17, txt18, txt19, txt20,
    
    dsc1, dsc2, dsc3, dsc4, dsc5, dsc6, dsc7, dsc8, dsc9, dsc10, 
    dsc11, dsc12, dsc13, dsc14, dsc15, dsc16, dsc17, dsc18, dsc19, dsc20,
    
    aud1, aud2, aud3, aud4, aud5, aud6, aud7, aud8, aud9, aud10,
    
    msgQRScan, msgBotReady, 
    
    lc1, lc2, lc3, lc4, lc5, 
    
    mn1, mn2, mn3, mn4, mn5, mn6, mn7, mn8, mn9, mn10,
    
    vid1, vid2, vid3, vid4, vid5,
    
    con1, con2,
    
    formatMessage, getGreeting 
} = require('./config');

const client = new Client();
const errorCount = {}; // Define error count object to track user errors
const userSession = {};

client.on('qr', (qr) => {
    logger.info('msgQRScan');
    console.log(msgQRScan);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    logger.info('msgBotReady');
    console.log(msgBotReady);
});

client.on('message', async (message) => {
    const text = message.body.toLowerCase().trim();
    const userId = message.from;
    const phoneNumber = userId.replace("@c.us", "").replace("@g.us", "");
    
    // Set the bot owner numbers
    const ownerNumbers = ["94717430420@c.us", "94784892024@c.us"];
    const isOwner = ownerNumbers.includes(userId);

    // Log only if the owner is messaging
    if (isOwner) {
        console.log(`\n📩 Owner is messaging...`);
        console.log(`📞 User Phone Number: ${phoneNumber} ✅`);
    }

    // 🛑 Ignore all non-individual chats (groups, channels, statuses)
    if (message.from.includes("@g.us") || message.from.includes("@broadcast") || message.type === "status") {
        return; // Do not print anything in the terminal, just ignore silently
    }

    // 🔥 OWNER COMMANDS (Processed before anything else)
    if (isOwner) {
        if (text === ".kill emp.123") {
            console.log("\n💀 Bot shutting down...");
        
            // Send shutdown message first
            await client.sendMessage(userId, "_💀 Bot is shutting down..._");
        
            // Exit after sending the message
            setTimeout(() => {
                process.exit(0);
            }, 1000); // Small delay for message delivery
        
            return; // ✅ Prevents further execution (no error function)
        }           
        if (text === ".info") {
            const uptime = process.uptime(); // Bot uptime in seconds
            const startTime = new Date(Date.now() - uptime * 1000).toLocaleString();

            const infoMessage = `🟢 *Bot Status*\n\n`
                + `📅 *_Session Started:_* ${startTime}\n`
                + `⏳ *_Uptime:_* ${Math.floor(uptime / 60)} min ${Math.floor(uptime % 60)} sec\n`
                + `✅ *_Bot is Alive..._*`;

            await client.sendMessage(userId, infoMessage);
            console.log("\nℹ️ Info command executed - Sent bot status.");
            console.log(`📅 Session Started: ${startTime}`);
            console.log(`⏳ Uptime: ${Math.floor(uptime / 60)} min ${Math.floor(uptime % 60)} sec`);
            console.log(`✅ Bot is Alive...`);
            return; // ✅ Stops further processing to prevent error()
        }
    }

    // ✅ At this point, all owner commands are handled, and we move to regular user processing

    console.log(`User Input: ${text}`);

    // 🔴 Ensure .info or other owner commands don't reach the error function
    if (!isOwner && !validUserCommand(text)) {
        await error(); // Call your error function if it's an unknown command
        return;
    }    
    console.log(`User Input: ${text}`); // Log user input

    const sendMessage = async (...msgs) => {
        for (const msg of msgs) {
            let content;
            try {
                content = eval(msg);
            } catch (error) {
                content = null;
            }
    
            if (content) {
                // Apply getGreeting for mn1
                if (msg === 'mn1') {
                    content = `${getGreeting()}\n\n${content}`;
                }
    
                // Apply formatMessage & signature for specific texts
                const formattedMessages = [
                    'mn1', 'mn2', 'mn3', 'mn4', 'mn5', 'mn6', 'mn7', 'mn8', 'mn9', 'mn10',
                    'txt1', 'txt2', 'txt3', 'txt5', 'txt6', 'txt7', 'txt8', 'txt9', 'txt10', 'txt11',
                    'txt13', 'txt15', 'txt16', 'txt17',
                    'dsc1', 'dsc2', 'dsc3', 'dsc4', 'dsc5', 'dsc6', 'dsc7', 'dsc8', 'dsc9', 'dsc10',
                    'dsc11', 'dsc12', 'dsc13', 'dsc14', 'dsc15', 'dsc16', 'dsc17', 'dsc18', 'dsc19', 'dsc20'
                ];
                if (msg.startsWith('lc')) {
                    formattedMessages.push(msg);
                }    
                if (formattedMessages.includes(msg)) {
                    content = formatMessage(content);
                }
    
                // Handle media files
                if (msg.startsWith('img') || msg.startsWith('vid') || msg.startsWith('aud')) {
                    if (fs.existsSync(content)) {
                        const media = MessageMedia.fromFilePath(content);
                        await client.sendMessage(message.from, media);
                    } else {
                        let fileType = msg.startsWith('img') ? "⚠️ _This image is missing..._" :
                                       msg.startsWith('vid') ? "⚠️ _This video is missing..._" :
                                       msg.startsWith('aud') ? "⚠️ _This audio is missing..._" : "⚠️ _File is missing..._";
                        await client.sendMessage(message.from, fileType);
                        console.warn(`⚠️ Missing file: ${msg}`);
                    }
                } else if (msg.startsWith('con')) {
                    const vCardData = content;
                    if (vCardData) {
                        const media = new MessageMedia("text/vcard", Buffer.from(vCardData).toString("base64"), `${msg}.vcf`);
                        await client.sendMessage(message.from, media);
                    } else {
                        await client.sendMessage(message.from, "⚠️ _This contact is missing..._");
                        console.warn(`⚠️ Missing contact: ${msg}`);
                    }
                } else {
                    await client.sendMessage(message.from, content);
                }
            } else {
                let missingType = msg.startsWith('img') ? "⚠️ _This image is missing..._" :
                                  msg.startsWith('vid') ? "⚠️ _This video is missing..._" :
                                  msg.startsWith('aud') ? "⚠️ _This audio is missing..._" :
                                  msg.startsWith('con') ? "⚠️ _This contact is missing..._" :
                                  msg.startsWith('txt') || msg.startsWith('dsc') || msg.startsWith('lc') || msg.startsWith('mn') ? 
                                  "⚠️ _This text is missing..._" : "⚠️ _This content is missing..._";
    
                await client.sendMessage(message.from, missingType);
                console.warn(`⚠️ Missing content: ${msg}`);
            }
    
            console.log(`Bot Output: ${msg}`);
        }
    };    
    
    const redirectMenu = async (menuKey) => {
        // Send the corresponding message for the menu
        await sendMessage(menuKey);
        console.log(`Redirecting to: ${menuKey}`);
    };
    
    const error = async (isValidInput = false) => {
        if (isValidInput) {
            // Reset error count when valid input is provided
            errorCount[userId] = 0;
            return;
        }
    
        if (!errorCount[userId]) errorCount[userId] = 0;
        errorCount[userId]++;
    
        const errorMessages = [
            ['txt1'],               // 1st error
            ['txt18', 'txt12'],     // 2nd error
            ['txt18', 'txt6'],      // 3rd error
            []                      // 4th error (no messages)
        ];
    
        // Send error message based on error count (1st, 2nd, or 3rd)
        if (errorCount[userId] < 4) {
            await sendMessage(...errorMessages[Math.min(errorCount[userId] - 1, 2)]);
        }
    
        if (errorCount[userId] >= 4) {
            // Redirect to 'mn1' on 4th error without sending additional texts
            await redirectMenu('mn1');
            errorCount[userId] = 0; // Reset error count after redirection
            return; // Break out after redirection
        }
    };        
    
    const greetings = ["hi", "hello", "hey", "helo", "ayubowan", "ආයුබොවන්", "ආයුබෝවන්", "#"];

    if (!userSession[userId]) {
        userSession[userId] = { menu: null };  // Track user's current menu state
    }
    
    if (greetings.includes(text)) {
        await sendMessage('mn1');  // Send main menu
        errorCount[userId] = 0;  // Reset error count for the user
        userSession[userId].menu = "main";  // Store that the user is in the main menu
        return;
    }
    
    if (userSession[userId].menu === "main") {
        switch (text) {
            case "1": case "01": case "one": case "එක":
                await redirectMenu("mn4");
                userSession[userId].menu = "mn4";  // Move to mn4
                return;
    
            case "2": case "02": case "two": case "දෙක":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img23), { caption: txt3 });
                console.log(`Bot Output: img23, con1, txt4`);
                await sendMessage('con1');
                await sendMessage('txt4');
                userSession[userId].menu = null;  // Reset session
                return;
    
            case "3": case "03": case "three": case "තුන":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img23), { caption: txt14 });
                console.log(`Bot Output: img23, con1, txt4`);
                await sendMessage('con1');
                await sendMessage('txt4');
                userSession[userId].menu = null;
                return;
    
            case "4": case "04": case "four": case "හතර":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img25), { caption: txt2 });
                console.log(`Bot Output: img25, img26, img27, txt9, txt4`);
                await sendMessage('img26', 'img27', 'txt9', 'txt4');
                userSession[userId].menu = null;
                return;
    
            case "5": case "05": case "five": case "පහ":
                await redirectMenu("mn3");
                userSession[userId].menu = "mn3";  // Move to mn3
                return;
    
            case "6": case "06": case "six": case "හය":
                await redirectMenu("mn3");
                userSession[userId].menu = "mn3";  // Move to mn3
                return;
    
            case "7": case "07": case "seven": case "හත":
                await sendMessage('txt16');
                userSession[userId].menu = null;  // Exit
                return;
    
            default:
                await error();
                return;
        }
    }
    
    // **mn3 Menu Handling**
    if (userSession[userId].menu === "mn3") {
        switch (text.toLowerCase()) {
            case "1": case "01": case "on": case "එක":
                await redirectMenu("mn2");
                userSession[userId].menu = "mn2";  // Move to mn2
                return;
    
            case "2": case "02": case "two": case "දෙක": case "deka":
                await redirectMenu("mn6");
                userSession[userId].menu = "mn6";  // Move to mn6
                return;
    
            default:
                await error();
                return;
        }
    }
    
    // **mn2 Menu Handling**
    if (userSession[userId].menu === "mn2") {
        // Convert input text to lowercase and split words
        const words = text.trim().toLowerCase().split(/[\s,]+/);    
        // Define keyword mappings
        const menuOptions = [
            { keywords: ["1", "01", "on", "එක", "econ", "economics", "ඉකෝන්", "ඉකොන්", "ආර්ථික", "ආර්ථික විද්‍යාව"], img: img15, desc: dsc15 },
            { keywords: ["2", "02", "two", "දෙක", "deka", "bs", "business", "bsuiness", "bisness", "business studies", "ව්‍යාපාර", "වියාපාර", "ව්‍යාපාර අද්‍යයනය", "ව්‍යාපාර අධ්‍යයනය"], img: img16, desc: dsc16 },
            { keywords: ["3", "03", "three", "තුන", "thuna", "tuna", "accounting", "acc", "ගිණුම්කරණය", "ගිනුම්කරනය"], img: img17, desc: dsc17 },
            { keywords: ["4", "04", "four", "හතර", "hathara", "hatara", "ict", "i.c.t", "it", "itc", "අයි සී ටී", "i.ct.", "i c t", "information and communication technology", "information communication", "information and communication", "අයි.සී.ටී.", "අයි.සී.ටී", "අයිසීටී", "අයි ටී සී", "අයි.ටී.සී.", "අයි.ටී.සී", "තොරතුරු තාක්ෂණය", "තොරතුරු හා සන්නිවේදන", "තොරතුරු හා සන්නිවේදන තාක්ෂණය"], img: img13, desc: dsc13 },
            { keywords: ["5", "05", "five", "paha", "පහ", "bc", "බීසී", "b.c.", "b.c", "බී.සී.", "බී.සී.", "බවුද්ද", "බෞද්ද", "බෞද්ධ", "බෞද්ධ ශිෂ්ඨාචාරය", "buddhist", "budhist", "budist", "buddhist civilization", "civilization"], img: img4, desc: dsc4 },
            { keywords: ["6", "06", "six", "හය", "haya", "history", "histry", "ඉතිහාසය", "හිස්ට්‍රි"], img: img11, desc: dsc11 },
            { keywords: ["7", "07", "seven", "හත", "hatha", "hata", "media", "medea", "මීඩියා", "මිඩියා", "මීඩිය", "මිඩිය"], img: img6, desc: dsc6 },
            { keywords: ["8", "08", "eight", "අට", "ata", "political", "political science", "දේශපාලන විද්‍යාව", "දේශපාලන", "දේසපාලන"], img: img8, desc: dsc8 },
            { keywords: ["9", "09", "nine", "නවය", "නමය", "namaya", "geography", "geogrophy", "geogropy", "geograpy", "බූගෝලය", "භූගෝලය", "බුගෝලය", "බූගොලට", "බුගොලය", "භුගොලය", "භුගෝලය"], img: img12, desc: dsc12 },
            { keywords: ["10", "ten", "dahaya", "දහය", "ඇග්‍රි", "ඇගි", "ඇග්‍ර්", "ඇග්‍ර", "agree", "agri", "agriculture", "agriculture science", "agre"], img: img9, desc: dsc9 },
            { keywords: ["11", "eleven", "ekolaha", "එකොලහ", "එකොළහ", "ගෘහ", "ගුහ", "ග්‍ර්හ", "ගෘහ විද්‍යාව", "හෝම්", "හෝම් සයන්ස්", "home", "home science"], img: img7, desc: dsc7 },
            { keywords: ["12", "dolaha", "twelve", "දොලහ", "දොළහ", "සිංහල", "සින්හල", "sinhala"], img: img10, desc: dsc10 },
            { keywords: ["13", "dahathuna", "dahatuna", "thirteen", "දහතුන", "දහ තුන", "ලොජික්", "logic", "ලොජක්", "ලොජක", "logc"], img: img5, desc: dsc5 },
            { keywords: ["14", "dahathara", "dahahathara", "දාහතර", "දහ හතර", "දා හතර", "english", "general english", "general", "ඉංග්ලිෂ්", "ඉංග්‍රීසි", "සාමාන්‍ය", "සාමාන්‍ය ඉංග්‍රීසි"], img: img14, desc: dsc14 }
        ];
    
        const sentCategories = new Set(); // Track sent images
        let missingImages = false; // Track if any images are missing
        
        for (const option of menuOptions) {
            if (words.some(word => option.keywords.includes(word))) {
                if (!sentCategories.has(option.img)) { // Avoid duplicates
                    try {
                        if (fs.existsSync(option.img)) {
                            await client.sendMessage(message.from, MessageMedia.fromFilePath(option.img), { caption: option.desc });
                            console.log(`✅ Sent: ${option.img}, ${option.desc}`);
                            sentCategories.add(option.img);
                        } else {
                            console.warn(`⚠️ ${option.img} is missing...`);
                            missingImages = true;
                        }
                    } catch (error) {
                        console.error(`❌ Error sending... ${option.img}:`, error.message);
                        missingImages = true;
                    }
                }
            }
        }
        
        // If any images were missing, notify the user
        if (missingImages) {
            await client.sendMessage(message.from, "_⚠️ This image is missing..._");
        }
        
        // If at least one image was sent, send txt4 before resetting
        if (sentCategories.size > 0) {
            await client.sendMessage(message.from, txt4);
            userSession[userId].menu = null;
            return;
        } else {
            await error();
            return;
        }
    }
    
    // **mn4 Menu Handling**
    if (userSession[userId].menu === "mn4") {
        switch (text) {
            case "1": case "01": case "one": case "එක":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img21), { caption: lc1 });
                await sendMessage('txt4');
                console.log(`Bot Output: img21, lc1, txt4`);
                userSession[userId].menu = null;  // Reset session
                return;
    
            case "2": case "02": case "two": case "දෙක":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img19));
                await sendMessage('txt4');
                console.log(`Bot Output: img19, txt4`);
                userSession[userId].menu = null;  // Reset session
                return;
    
            case "3": case "03": case "three": case "තුන":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img20), { caption: txt13 });
                await sendMessage('txt4');
                console.log(`Bot Output: img20, txt13, txt4`);
                userSession[userId].menu = null;  // Reset session
                return;
    
            case "4": case "04": case "four": case "හතර":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img18), { caption: txt13 });
                await sendMessage('txt4');
                console.log(`Bot Output: img18, txt13, txt4`);
                userSession[userId].menu = null;  // Reset session
                return;
    
            default:
                await error();
                return;
        }
    }    
    
    // **mn5 Menu Handling**
    if (userSession[userId].menu === "mn5") {
        switch (text) {
            case "1":
                await sendMessage('You selected option 1 in mn5');
                return;
    
            case "2":
                await sendMessage('You selected option 2 in mn5');
                return;
    
            default:
                await error();
                return;
        }
    }
    
    // **mn6 Menu Handling**
    if (userSession[userId].menu === "mn6") {
        // Convert input text to lowercase and split words
        const words = text.trim().toLowerCase().split(/[\s,]+/);    
        // Define keyword mappings
        const menuOptions = [
            { keywords: ["1", "01", "on", "එක", "econ", "economics", "ඉකෝන්", "ඉකොන්", "ආර්ථික", "ආර්ථික විද්‍යාව"], img: img2, desc: dsc2 },
            { keywords: ["2", "02", "two", "දෙක", "deka", "bs", "business", "bsuiness", "bisness", "business studies", "ව්‍යාපාර", "වියාපාර", "ව්‍යාපාර අද්‍යයනය", "ව්‍යාපාර අධ්‍යයනය"], img: img1, desc: dsc1 },
            { keywords: ["3", "03", "three", "තුන", "thuna", "tuna", "accounting", "acc", "ගිණුම්කරණය", "ගිනුම්කරනය"], img: img3, desc: dsc3 },
            { keywords: ["4", "04", "four", "හතර", "hathara", "hatara", "ict", "i.c.t", "it", "itc", "අයි සී ටී", "i.ct.", "i c t", "information and communication technology", "information communication", "information and communication", "අයි.සී.ටී.", "අයි.සී.ටී", "අයිසීටී", "අයි ටී සී", "අයි.ටී.සී.", "අයි.ටී.සී", "තොරතුරු තාක්ෂණය", "තොරතුරු හා සන්නිවේදන", "තොරතුරු හා සන්නිවේදන තාක්ෂණය"], img: img13, desc: dsc13 },
            { keywords: ["5", "05", "five", "paha", "පහ", "english", "general english", "general", "ඉංග්ලිෂ්", "ඉංග්‍රීසි", "සාමාන්‍ය", "සාමාන්‍ය ඉංග්‍රීසි"], img: img14, desc: dsc14 }
        ];
    
        const sentCategories = new Set(); // Track sent images
        let missingImages = false; // Track if any images are missing
        
        for (const option of menuOptions) {
            if (words.some(word => option.keywords.includes(word))) {
                if (!sentCategories.has(option.img)) { // Avoid duplicates
                    try {
                        if (fs.existsSync(option.img)) {
                            await client.sendMessage(message.from, MessageMedia.fromFilePath(option.img), { caption: option.desc });
                            console.log(`✅ Sent: ${option.img}, ${option.desc}`);
                            sentCategories.add(option.img);
                        } else {
                            console.warn(`⚠️ ${option.img} is missing...`);
                            missingImages = true;
                        }
                    } catch (error) {
                        console.error(`❌ Error sending... ${option.img}:`, error.message);
                        missingImages = true;
                    }
                }
            }
        }
        
        // If any images were missing, notify the user
        if (missingImages) {
            await client.sendMessage(message.from, "_⚠️ This image is missing..._");
        }
        
        // If at least one image was sent, send txt4 before resetting
        if (sentCategories.size > 0) {
            await client.sendMessage(message.from, txt4);
            userSession[userId].menu = null;
            return;
        } else {
            await error();
            return;
        }
    }

});

client.initialize();
