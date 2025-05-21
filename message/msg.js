"use strict";
require('dotenv').config();
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { color } = require("../lib/color");
const fs = require("fs");
const os = require('os');
const https = require('https');
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const moment = require("moment-timezone");
const util = require("util");
const { exec } = require("child_process");
const yts = require("yt-search");
const axios = require('axios');
const logger = require("pino");
const { ytmp4, ytmp3, ttdl, fbdl } = require("ruhend-scraper");
const insta = require("priyansh-ig-downloader");
const gifted = require("gifted-dls");
const imgbb = require("imgbb-uploader");

/**           Gemini AI                */ 
// msg.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDK-JvMJG3KFWWJ_-rmaQS-IYzHhrQUNAA");
const model = genAI.getGenerativeModel({
   model: "gemini-1.5-flash",
   systemInstruction: "Kamu adalah Lyne, asisten AI yang pintar dan ramah."
});

module.exports = { model };  // Mengekspor model untuk diakses oleh file lain
moment.tz.setDefault("Asia/Kuala_Lumpur").locale("id");

module.exports = async (conn, msg, m) => {
	try {
		if (msg.key.fromMe) return
		const { type, isQuotedMsg, quotedMsg, mentioned, now, fromMe } = msg;
		const toJSON = (j) => JSON.stringify(j, null, "\t");
		const messageType = msg.message && typeof msg.message === "object" 
  ? Object.keys(msg.message)[0] 
  : null;
		const from = msg.key.remoteJid;
		const msgKey = msg.key
		const chats =
  type === "conversation" && msg.message?.conversation
    ? msg.message.conversation
    : type === "imageMessage" && msg.message?.imageMessage?.caption
    ? msg.message.imageMessage.caption
    : type === "videoMessage" && msg.message?.videoMessage?.caption
    ? msg.message.videoMessage.caption
    : type === "extendedTextMessage" && msg.message?.extendedTextMessage?.text
    ? msg.message.extendedTextMessage.text
    : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption
    ? msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage.caption
    : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption
    ? msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.caption
    : "";

// Log untuk debugging
console.log("Nilai chats:", chats); // Ini akan mencetak apa pun nilai chats

// Pastikan tidak ada null atau undefined
const command = (chats || "").toLowerCase().split(" ")[0] || "";
const args = (chats || "").split(" ");

// Log setelah pemrosesan
console.log("Command:", command);
console.log("Args:", args);
		const isGroup = msg.key.remoteJid.endsWith("@g.us");
		const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
		const groupName = isGroup ? groupMetadata.subject : ''
		const sender = isGroup ? msg.key.participant ? msg.key.participant : msg.participant : msg.key.remoteJid;
		const userId = sender.split("@")[0]
		const isOwner = ["63xxx@s.whatsapp.net"].includes(sender) ? true : false;
		const isSelf = true; // Ubah ke false untuk mode publik
                if (isSelf && !isOwner) return; // Jika mode self aktif, hanya owner yang bisa pakai bot
		const pushname = msg.pushName;
		const q = chats.slice(command.length + 1, chats.length);
		const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
		const isCmd = chats.startsWith('.')
		const content = JSON.stringify(msg.message)
		const isMedia = (messageType === 'imageMessage' || messageType === 'videoMessage')
		const isQuotedImage = (messageType === 'extendedTextMessage' || messageType === 'imageMessage') && content.includes('imageMessage')
		const isQuotedVideo = (messageType === 'extendedTextMessage' || messageType === 'videoMessage') && content.includes('videoMessage')
		
		const isUrl = (url) => {
			return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
		}
		
		async function downloadAndSaveMediaMessage (type_file, path_file) {
        	if (type_file === 'image') {
                var stream = await downloadContentFromMessage(msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, 'image')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'video') {
                var stream = await downloadContentFromMessage(msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, 'video')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'sticker') {
                var stream = await downloadContentFromMessage(msg.message.stickerMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.stickerMessage, 'sticker')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	} else if (type_file === 'audio') {
                var stream = await downloadContentFromMessage(msg.message.audioMessage || msg.message.extendedTextMessage?.contextInfo.quotedMessage.audioMessage, 'audio')
                let buffer = Buffer.from([])
                for await(const chunk of stream) {
                	buffer = Buffer.concat([buffer, chunk])
                }
                fs.writeFileSync(path_file, buffer)
                return path_file
        	}
        }
		
		const reply = (teks) => {
			conn.sendMessage(from, { text: teks }, { quoted: msg });
		};
		
		const fakereply = (chat1, target, chat2) => {
		    conn.sendMessage(from, {text:chat1}, {quoted: { key: { fromMe: false, participant: `${target}@s.whatsapp.net`, ...(from ? { remoteJid: from } : {}) }, message: { conversation: chat2 }}})
		}
		
		const reactMessage = (react) => {
			var reactMsg = {
				react: {
					text: react,
					key: msg.key
				}
			}
			conn.sendMessage(from, reactMsg)
		}
		
		const getRandom = (ext) => {
			return `${Math.floor(Math.random() * 10000)}${ext}`
		}
		
		async function compressMP3(inputUrl, outputPath, bitrate = '128k') {
    return new Promise((resolve, reject) => {
        ffmpeg(inputUrl)
            .audioBitrate(bitrate)
            .toFormat('mp3')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

         async function convertToOpus(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('opus')
            .audioCodec('libopus')
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File dihapus: ${filePath}`);
    }
}
		
		//conn.sendPresenceUpdate("available", from);
		
		if (!isGroup && isCmd && !fromMe) {
			console.log("->[\x1b[1;32mCMD\x1b[1;37m]", color(moment(msg.messageTimestamp * 1000).format("DD/MM/YYYY HH:mm:ss"), "yellow"), color(`${command} [${args.length}]`), "from", color(pushname));
		}
		if (isGroup && isCmd && !fromMe) {
			console.log("->[\x1b[1;32mCMD\x1b[1;37m]", color(moment(msg.messageTimestamp * 1000).format("DD/MM/YYYY HH:mm:ss"), "yellow"), color(`${command} [${args.length}]`), "from", color(pushname), "in", color(groupName));
		}
		
		switch (command) {
case '.start':
			case '.menu':
			case '.help':
               var textReply = `Selamat datang di Yuna Store! Kami menyediakan berbagai jam tangan original dengan harga terbaik dan kualitas terjamin.

📌 Fitur Belanja Cepat:
🔍 Cari Jam Tangan → .cari [merek/harga]
🛍 Lihat Katalog → .catalog
📦 Pesan Langsung → .pesan [nama jam]
🚚 Cek Status Order → .cekorder [nomor order]

💎 Kenapa Belanja di Yuna Store?
✅ 100% Produk Original & Bergaransi
✅ Pengiriman Cepat & Aman ke seluruh Indonesia
✅ Bisa COD (Bayar di Tempat) di beberapa wilayah
✅ Garansi Resmi hingga 1 Tahun

🔥 Promo Spesial!
Dapatkan diskon hingga 50% untuk produk tertentu. Jangan sampai kehabisan!

📩 Untuk info lebih lanjut, hubungi admin.`
				reply(textReply)
				break
				
				case '.runtime':
case '.uptime': {
    let runtime = process.uptime(); // Mengambil uptime bot
    let hours = Math.floor(runtime / 3600);
    let minutes = Math.floor((runtime % 3600) / 60);
    let seconds = Math.floor(runtime % 60);

    let start = performance.now(); // Mulai hitung ping
    let end = performance.now();   // Selesai hitung ping
    let ping = (end - start).toFixed(2);

    let vpsInfo = `
🖥 *Informasi VPS*  
- OS: ${os.type()} ${os.release()}  
- Arsitektur: ${os.arch()}  
- CPU: ${os.cpus()[0].model}  
- RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB  
- RAM Terpakai: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB  
- Uptime: ${hours} jam ${minutes} menit ${seconds} detik  
- Ping: ${ping} ms  
    `;

    reply(vpsInfo);
    break;
}
			case '.ytmp4':
case '.mp4':
    if (args.length < 2) return reply(`Input judul atau link YouTube.`);
    reactMessage("");
    var search = await yts(q);
    var link = search.all[0].url;
    axios.get(`https://vihangayt.me/download/ytmp4?url=${link}`)
        .then(({ data }) => {
            const info = data;
            const caption = `\`\`\`Video Ditemukan\`\`\`\n\nJudul: ${info.title}\nChannel: ${info.channel}\nDurasi: ${info.duration}\n\n\`\`\`Enjoy!\`\`\``;
            conn.sendMessage(from, { video: { url: info.dl_link }, caption }, { quoted: msg });
        })
        .catch(err => {
            console.log(err);
            reply('Maaf terjadi kesalahan, sistem error atau link tidak valid.');
        });
    break
case '.ytmp3':
case '.mp3':
case '.play':
    if (args.length < 2) return reply(`Input judul atau link YouTube.`);
    reactMessage("");
    var search = await yts(q);
    var link = search.all[0].url;
    axios.get(`https://vihangayt.me/download/ytmp3?url=${link}`)
        .then(async ({ data }) => {
            const info = data;
            const caption = `\`\`\`Lagu Ditemukan\`\`\`\n\nJudul: ${info.title}\nChannel: ${info.channel}\nDurasi: ${info.duration}\n\n\`\`\`Mengirim...\`\`\``;
            conn.sendMessage(from, { image: { url: info.thumbnail }, caption }, { quoted: msg });
            conn.sendMessage(from, { audio: { url: info.dl_link }, mimetype: 'audio/mp4' }, { quoted: msg });
        })
        .catch(err => {
            console.log(err);
            reply('Maaf terjadi kesalahan, sistem error atau link tidak valid.');
        });
    break
case '.ttdl':
case '.tiktok':
case '.tiktokdl':
    if (args.length < 2) return reply(`Input link untuk mendownload video dari TikTok.`);
    reactMessage("");
    axios.get(`https://api.neoxr.eu.org/api/tiktok?url=${q}`)
        .then(({ data }) => {
            const result = data.result;
            const caption = `\`\`\`Video Ditemukan\`\`\`\n\n*Username:* ${result.username}\n*Publish:* ${result.published}\n*Likes:* ${result.likes}\n*Views:* ${result.views}\n\n\`\`\`Enjoy!\`\`\``;
            conn.sendMessage(from, { video: { url: result.video }, caption }, { quoted: msg });
            reply(`Jika kamu ingin download musiknya:\n${result.music}`);
        })
        .catch(err => {
            console.log(err);
            reply('Maaf terjadi kesalahan, sistem error atau link tidak valid.');
        });
    break
case '.fbdl':
    if (args.length < 2) return reply(`Input link untuk mendownload media dari Facebook.`);
    reactMessage("");
    axios.get(`https://api.neoxr.eu.org/api/facebook?url=${q}`)
        .then(({ data }) => {
            conn.sendMessage(from, { video: { url: data.result.video }, caption: '```Media ditemukan```' }, { quoted: msg });
        })
        .catch(err => {
            console.log(err);
            reply('Maaf terjadi kesalahan, sistem error atau link tidak valid.');
        });
    break
case '.twtdl':
case '.xdl':
    if (args.length < 2) return reply(`Input link untuk mendownload media dari Twitter/X.`);
    reactMessage("");
    reply('Tunggu sebentar, sedang mengunduh...');
    axios.get(`https://api.neoxr.eu.org/api/twitter?url=${q}`)
        .then(({ data }) => {
            const vid = data.result[0]?.url;
            if (!vid) throw 'Media tidak ditemukan';
            conn.sendMessage(from, { video: { url: vid }, caption: '```Enjoy```' }, { quoted: msg });
        })
        .catch(err => {
            console.log(err);
            reply('Maaf terjadi kesalahan, sistem error atau link tidak valid.');
        });
    break
case '.igdl':
    if (args.length < 2) return reply(`Input link dari Instagram, untuk mendownload media yang diinginkan.`);
    reactMessage("");
    axios.get(`https://api.neoxr.eu.org/api/igdl?url=${q}`)
        .then(({ data }) => {
            if (data.result.image) {
                for (let img of data.result.image) {
                    conn.sendMessage(from, { image: { url: img } }, { quoted: msg });
                }
            }
            if (data.result.video) {
                for (let vid of data.result.video) {
                    conn.sendMessage(from, { video: { url: vid.video } }, { quoted: msg });
                }
            }
        })
        .catch(err => {
            console.log(err);
            reply('Maaf terjadi kesalahan, sistem error atau link tidak valid.');
        });
    break															        			
			case '>>':
				if (!isOwner) return reply(`Maaf, ini hanya dapat digunakan oleh Owner Bot`)
				try {
					let evaled = await eval(q);
					if (typeof evaled !== "string")
					evaled = require("util").inspect(evaled);
					reply(`${evaled}`);
				} catch (e) {
					reply(`${e}`)
				}
				break
		default:
			if (isGroup) return // tidak dapat digunakan didalam grup
			// if (!['conversation', 'extendedTextMessage'].includes(msg.type)) return reply(`Maaf, aku hanya menerima pesan teks!`)
			console.log("->[\x1b[1;32mNew\x1b[1;37m]", color('Question From', 'yellow'), color(pushname, 'lightblue'), `: "${chats}"`)
			conn.sendPresenceUpdate("composing", from);
			try {
				/*
				* @febbyadityan
				* please include the source if you want to copy this code.
				* http://github.com/FebbAdityaN
				*/
				conn.gemini[sender] ? conn.gemini[sender] : conn.gemini[sender] = {}
				conn.gemini[sender].history ? conn.gemini[sender].history : conn.gemini[sender].history = []
				const caption = msg.message.imageMessage?.caption ? msg.message.imageMessage.caption : "";
				if (isQuotedImage) {
					const ran = getRandom('.jpg')
					const media = await downloadAndSaveMediaMessage("image", `./lib/${ran}`)
					const img = await imgbb("6cb3819a5973e63cfa33bd63c33545d5", `./lib/${ran}`)
					const imgData = img.display_url.split(/\//);
					const imageResp = await fetch(`https://i.ibb.co.com/${imgData[3]}/${imgData[4]}`).then((response) => response.arrayBuffer());
					await new Promise(r => setTimeout(r, 3000));
					const result = await model.generateContent([
						{
							inlineData: {
								data: Buffer.from(imageResp).toString("base64"),
								mimeType: "image/jpeg",
							},
						},
						caption
					]);
					reply(result.response.text().trim())
					fs.unlinkSync(media)
					return reactMessage("")
				} else {
					const chat = model.startChat(conn.gemini[sender])
					let resdata = await chat.sendMessage(chats);
					conn.gemini[sender].history.push({
						role: "user",
						parts: [{
							text: chats
						}]
					}, {
						role: "model",
						parts: [{
							text: resdata.response.text().trim()
						}]
					})
					reply(resdata.response.text().trim());
					return reactMessage("")
				}
			} catch(e) {
				console.log(e)
				reply("Server error, coba lain waktu:(")
			}
			break
    }
  } catch (err) {
    console.log(color("[ERROR]", "red"), err);
  }
};
