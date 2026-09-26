const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('TURBO CITY Bot Connected Successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // গ্রুপে কেউ জয়েন করলে ওয়েলকাম মেসেজ ও ছবি পাঠানোর লজিক
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            const participants = anu.participants;
            
            for (const num of participants) {
                if (anu.action === 'add') {
                    const welcomeMessage = `╔══════════════════════╗
🔥  WELCOME TO TURBO CITY  🔥
╚══════════════════════╝

👋 Hello @${num.split('@')[0]}!

👑 MEHERPUR #4 • FREE FIRE GUILD
🏆 KHULNA DIVISION #86
❤️ ONE SQUAD • ONE FAMILY ❤️

━━━━━━━━━━━━━━━━━━
📜 『 GROUP RULES 』
━━━━━━━━━━━━━━━━━━

🤝 01. সবাই সবার সাথে Respectfully কথা বলবেন।
🚫 02. কোনো ধরনের গালাগালি / অশালীন আচরণ করা যাবে না।
📢 03. কোনো ধরনের Promotion / Spam করা নিষেধ।
💰 04. Group-এ কোনো ধরনের Buy / Sell করা যাবে না।
⚠️ 05. Fake ID / Scam / Fraud সম্পূর্ণ নিষিদ্ধ।
🔗 06. অপ্রয়োজনীয় Link / Advertisement শেয়ার করা যাবে না।
👑 07. সকল Admin-এর সিদ্ধান্তকে Respect করতে হবে।
🆘 08. কোনো সমস্যা হলে সরাসরি Admin-এর সাথে যোগাযোগ করুন।
❤️ 09. সবসময় আমাদের TURBO CITY-এর নাম ও সম্মান বজায় রাখুন।

━━━━━━━━━━━━━━━━━━
⚔️ 『 GUILD WAR RULES 』
━━━━━━━━━━━━━━━━━━

🗓️ বুধবার • শুক্রবার • শনিবার
⏰ সন্ধ্যা ৭টা — রাত ১১টা

🔥 এই ৩ দিন সবাইকে GUILD WAR-এ Active থাকতে হবে।

❌ যারা নিয়মিত GUILD WAR খেলতে পারবেন না,
তাদের আমাদের GUILD-এ থাকার প্রয়োজন নেই।

🎮 যদি কোনো কারণে কেউ সন্ধ্যা ৭টা থেকে GUILD WAR খেলতে না পারেন,
তাহলে অবশ্যই রাত ১১টার আগে কিছু ম্যাচ খেলার চেষ্টা করতে হবে।

━━━━━━━━━━━━━━━━━━
🏆 PLAY • FIGHT • WIN 🏆
🔥 TURBO CITY 🔥
👑 ONE SQUAD • ONE FAMILY 👑
━━━━━━━━━━━━━━━━━━

💫 নতুন Member-কে সবাই Welcome জানাও!
❤️ Stay Active • Stay Loyal • Stay United ❤️`;
                    
                    // ছবি এবং সাজানো গোছানো টেক্সট পাঠানো
                    await sock.sendMessage(anu.id, { 
                        image: fs.readFileSync('./welcome to.jpg'), 
                        caption: welcomeMessage,
                        mentions: [num]
                    });
                }
            }
        } catch (err) {
            console.log('Error in welcome message: ', err);
        }
    });
}

startBot();
