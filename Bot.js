const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('./logger');
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
    
                if (formattedMessages.includes(msg)) {
                    content = formatMessage(content);
                }
    
                // Handle media files
                if (msg.startsWith('img') || msg.startsWith('vid') || msg.startsWith('aud')) {
                    if (fs.existsSync(content)) {
                        const media = MessageMedia.fromFilePath(content);
                        await client.sendMessage(message.from, media, { caption: eval(`dsc${msg.slice(3)}`) || '' });
                    } else {
                        let fileType = msg.startsWith('img') ? "⚠️ _This image is missing_" :
                                       msg.startsWith('vid') ? "⚠️ _This video is missing_" :
                                       msg.startsWith('aud') ? "⚠️ _This audio is missing_" : "⚠️ _File is missing_";
                        await client.sendMessage(message.from, fileType);
                        console.warn(`⚠️ Missing file: ${msg}`);
                    }
                } else if (msg.startsWith('con')) {
                    const vCardData = content;
                    if (vCardData) {
                        const media = new MessageMedia("text/vcard", Buffer.from(vCardData).toString("base64"), `${msg}.vcf`);
                        await client.sendMessage(message.from, media);
                    } else {
                        await client.sendMessage(message.from, "⚠️ _This contact is missing_");
                        console.warn(`⚠️ Missing contact: ${msg}`);
                    }
                } else {
                    await client.sendMessage(message.from, content);
                }
            } else {
                let missingType = msg.startsWith('img') ? "⚠️ _This image is missing_" :
                                  msg.startsWith('vid') ? "⚠️ _This video is missing_" :
                                  msg.startsWith('aud') ? "⚠️ _This audio is missing_" :
                                  msg.startsWith('con') ? "⚠️ _This contact is missing_" :
                                  msg.startsWith('txt') || msg.startsWith('dsc') || msg.startsWith('mn') ? 
                                  "⚠️ _This text is missing_" : "⚠️ _Unknown missing content_";
    
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
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img22), { caption: txt3 });
                console.log(`Bot Output: img22, con1, txt4`);
                await sendMessage('con1');
                await sendMessage('txt4');
                userSession[userId].menu = null;  // Reset session
                return;
    
            case "3": case "03": case "three": case "තුන":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img22), { caption: txt14 });
                console.log(`Bot Output: img22, con1, txt4`);
                await sendMessage('con1');
                await sendMessage('txt4');
                userSession[userId].menu = null;
                return;
    
            case "4": case "04": case "four": case "හතර":
                await client.sendMessage(message.from, MessageMedia.fromFilePath(img24), { caption: txt2 });
                console.log(`Bot Output: img24, img25, img26, txt4`);
                await sendMessage('img25', 'img26', 'txt4');
                userSession[userId].menu = null;
                return;
    
            case "5": case "05": case "five": case "පහ":
                await redirectMenu("mn2");
                userSession[userId].menu = "mn2";  // Move to mn2
                return;
    
            case "6": case "06": case "six": case "හය":
                await redirectMenu("mn5");
                userSession[userId].menu = "mn5";  // Move to mn5
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
    
    // **mn2 Menu Handling**
    if (userSession[userId].menu === "mn2") {
        switch (text) {
            case "1":
                await sendMessage('You selected option 1 in mn2');
                return;
    
            case "2":
                await sendMessage('You selected option 2 in mn2');
                return;
    
            default:
                await error();
                return;
        }
    }
    
    // **mn3 Menu Handling**
    if (userSession[userId].menu === "mn3") {
        switch (text) {
            case "1":
                await sendMessage('You selected option 1 in mn3');
                return;
    
            case "2":
                await sendMessage('You selected option 2 in mn3');
                return;
    
            default:
                await error();
                return;
        }
    }
    
    // **mn4 Menu Handling**
    if (userSession[userId].menu === "mn4") {
        switch (text) {
            case "1": case "01": case "one":
                await sendMessage('You selected option 1 in mn4');
                return;
    
            case "2": case "02": case "two":
                await sendMessage('You selected option 2 in mn4');
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
        switch (text) {
            case "1":
                await sendMessage('You selected option 1 in mn6');
                return;
    
            case "2":
                await sendMessage('You selected option 2 in mn6');
                return;
    
            default:
                await error();
                return;
        }
    }
    
    // 3️⃣ If input doesn't match any valid menu flow, trigger error
    await error();
});

client.initialize();
