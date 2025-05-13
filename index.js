onst { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startSock() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (messageText?.toLowerCase() === "menu") {
            await sock.sendMessage(sender, { text: "📋 *Menu Bot:*\n1. menu\n2. ping\n3. chatgpt [prompt]" });
        } else if (messageText?.toLowerCase().startsWith("chatgpt ")) {
            const prompt = messageText.slice(8);
            const reply = `(dummy reply for "${prompt}")`; // Integrasi ke ChatGPT bisa ditambahkan
            await sock.sendMessage(sender, { text: reply });
        } else if (messageText?.toLowerCase() === "ping") {
            await sock.sendMessage(sender, { text: "pong" });
        }
    });

    sock.ev.on("creds.update", saveState);
}
startSock();
const venom = require('venom-bot');

venom.create().then((client) => start(client));

function start(client) {
  client.onMessage(async (message) => {
    if (message.body === 'menu') {
      client.sendText(message.from, '📋 *Menu Bot:*\n1. menu\n2. ping\n3. chatgpt [prompt]');
    } else if (message.body === 'ping') {
      client.sendText(message.from, 'pong');
    } else if (message.body.startsWith('chatgpt ')) {
      const prompt = message.body.slice(8);
      const reply = `balasan dummy dari prompt: ${prompt}`;
      client.sendText(message.from, reply);
    }
  });
}
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
    const message = req.body;
    console.log("📩 Webhook received:", message);
    res.sendStatus(200);
});

app.get('/send', async (req, res) => {
    const { to, text } = req.query;
    try {
        await axios.post(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
            messaging_product: "whatsapp",
            to,
            text: { body: text }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        res.send("Message sent!");
    } catch (e) {
        res.status(500).send("Error sending message.");
    }
});

app.listen(3000, () => console.log("✅ API Bot running on port 3000"));
