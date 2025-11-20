const express = require("express");
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");

const app = express();
let qrCodeStore = "";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        if (update.qr) {
            qrCodeStore = await qrcode.toDataURL(update.qr);
        }
    });

    // وقتی کاربر دستور !getfile زد، فایل تنظیمات را می‌فرستد
    sock.ev.on("messages.upsert", async (m) => {
        if (m.type === "notify") {
            const msg = m.messages[0];
            const from = msg.key.remoteJid;
            if (msg.message?.conversation === "!getfile") {
                await sock.sendMessage(from, { document: { url: "https://raw.githubusercontent.com/YOUR-USERNAME/ashita-bot/main/config.txt" }, fileName: "config.txt" });
            }
        }
    });
}

startBot();

app.get("/qr", (req, res) => {
    res.json({ qr: qrCodeStore });
});

app.listen(3000, () => console.log("Server ready"));
