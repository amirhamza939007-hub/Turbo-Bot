const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') {
            console.log('TURBO CITY Bot Connected Successfully! 🚀');
        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // গিল্ডে নতুন মেম্বার অ্যাড হলে তোমার দেওয়া ফুল ফরম্যাট অনুযায়ী ওয়েলকাম ও রুলস পাঠানোর হ্যান্ডলার
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            if (anu.action === 'add') {
                for (let num of anu.participants) {
                    const userTag = `@${num.split('@')[0]}`;
                    
                    let welcomeMessage = `╔══════════════════════╗\n` +
                                         `🔥  WELCOME TO TURBO CITY  🔥\n` +
                                         `╚══════════════════════╝\n\n` +
                                         `👑 MEHERPUR #4 • FREE FIRE GUILD\n` +
                                         `🏆 KHULNA DIVISION #86\n` +
                                         `❤️ ONE SQUAD • ONE FAMILY ❤️\n\n` +
                                         `━━━━━━━━━━━━━━━━━━\n` +
                                         `📜 『 GROUP RULES 』\n` +
                                         `━━━━━━━━━━━━━━━━━━\n\n` +
                                         `🤝 01. সবাই সবার সাথে Respectfully কথা বলবেন।\n` +
                                         `🚫 02. কোনো ধরনের গালাগালি / অশালীন আচরণ করা যাবে না।\n` +
                                         `📢 03. কোনো ধরনের Promotion / Spam করা নিষেধ।\n` +
                                         `💰 04. Group-এ কোনো ধরনের Buy / Sell করা যাবে না।\n` +
                                         `⚠️ 05. Fake ID / Scam / Fraud সম্পূর্ণ নিষিদ্ধ।\n` +
                                         `🔗 06. অপ্রয়োজনীয় Link / Advertisement শেয়ার করা যাবে না।\n` +
                                         `👑 07. সকল Admin-এর সিদ্ধান্তকে Respect করতে হবে।\n` +
                                         `🆘 08. কোনো সমস্যা হলে সরাসরি Admin-এর সাথে যোগাযোগ করুন।\n` +
                                         `❤️ 09. সবসময় আমাদের TURBO CITY-এর নাম ও সম্মান বজায় রাখুন।\n\n` +
                                         `━━━━━━━━━━━━━━━━━━\n` +
                                         `⚔️ 『 GUILD WAR RULES 』\n` +
                                         `━━━━━━━━━━━━━━━━━━\n\n` +
                                         `🗓️ বুধবার • শুক্রবার • শনিবার\n` +
                                         `⏰ সন্ধ্যা ৭টা — রাত ১১টা\n\n` +
                                         `🔥 এই ৩ দিন সবাইকে GUILD WAR-এ Active থাকতে হবে।\n\n` +
                                         `❌ যারা নিয়মিত GUILD WAR খেলতে পারবেন না,\n` +
                                         `তাদের আমাদের GUILD-এ থাকার প্রয়োজন নেই।\n\n` +
                                         `🎮 যদি কোনো কারণে কেউ সন্ধ্যা ৭টা থেকে GUILD WAR খেলতে না পারেন,\n` +
                                         `তাহলে অবশ্যই রাত ১১টার আগে কিছু ম্যাচ খেলার চেষ্টা করতে হবে।\n\n` +
                                         `━━━━━━━━━━━━━━━━━━\n` +
                                         `🏆 PLAY • FIGHT • WIN 🏆\n` +
                                         `🔥 TURBO CITY 🔥\n` +
                                         `👑 ONE SQUAD • ONE FAMILY 👑\n` +
                                         `━━━━━━━━━━━━━━━━━━\n\n` +
                                         `💫 নতুন Member ${userTag}-কে সবাই Welcome জানাও!\n` +
                                         `❤️ Stay Active • Stay Loyal • Stay United ❤️`;

                    await sock.sendMessage(anu.id, { 
                        text: welcomeMessage, 
                        mentions: [num] 
                    });
                }
            }
        } catch (error) {
            console.log('Error in welcome message:', error);
        }
    });
}

startBot();
