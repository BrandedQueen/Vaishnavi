const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const ytdl = require("@neoxr/ytdl-core");
const yts = require("yt-search");


async function lado(api, event, args, message) {
  try {
    const songName = args.join(" ");
    const searchResults = await yts(songName);

    if (!searchResults.videos.length) {
      message.reply("No song found for the given query.");
      return;
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const stream = ytdl(videoUrl, { filter: "audioonly" });
    const fileName = `music.mp3`;
    const filePath = path.join(__dirname, "tmp", fileName);

    stream.pipe(fs.createWriteStream(filePath));

    stream.on('response', () => {
      console.info('[DOWNLOADER]', 'Starting download now!');
    });

    stream.on('info', (info) => {
      console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
    });

    stream.on('end', () => {
      const audioStream = fs.createReadStream(filePath);
      message.reply({ attachment: audioStream });
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    });
  } catch (error) {
    console.error("Error:", error);
    message.reply("Sorry, an error occurred while processing your request.");
  }
}


async function kshitiz(api, event, args, message) {
  try {
    const query = args.join(" ");
    const response = await axios.get(`https://cc-project-apis-jonell-magallanes.onrender.com/api/tiktok/searchvideo?keywords=${query}`);

    if (response.data.code === 0 && response.data.data.videos.length > 0) {
      const videoUrl = response.data.data.videos[0].play;
      const videoFileName = `${response.data.data.videos[0].video_id}.mp4`;

      const tempVideoPath = path.join(__dirname, "tmp", videoFileName);
      const writer = fs.createWriteStream(tempVideoPath);

      const videoResponse = await axios.get(videoUrl, { responseType: "stream" });
      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
        const videoStream = fs.createReadStream(tempVideoPath);
        message.reply({ attachment: videoStream });
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });
    } else {
      message.reply(" no videos found for the given query.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  } catch (error) {
    console.error(error);
    message.reply("Sorry, an error occurred while processing your request.");
  }
}

const a = {
  name: "gpt",
  aliases: ["chatgpt"],
  version: "3.0",
  author: "kshitiz",
  countDown: 5,
  role: 0,
  longDescription: "Chat with GPT-4",
  category: "ai",
  guide: {
    en: "{p}gpt {prompt}"
  }
};

async function b(c, d, e, f) {
  try {
    const g = await axios.get(`https://ai-tools.replit.app/gpt?prompt=${encodeURIComponent(c)}&uid=${d}`);
    return g.data.gpt4;
  } catch (h) {
    throw h;
  }
}

async function i(c) {
  try {
    const j = await axios.get(`https://ai-tools.replit.app/sdxl?prompt=${encodeURIComponent(c)}&styles=7`, { responseType: 'arraybuffer' });
    return j.data;
  } catch (k) {
    throw k;
  }
}

async function describeImage(prompt, photoUrl) {
  try {
    const url = `https://sandipbaruwal.onrender.com/gemini2?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(photoUrl)}`;
    const response = await axios.get(url);
    return response.data.answer;
  } catch (error) {
    throw error;
  }
}

async function l({ api, message, event, args }) {
  try {
    const m = event.senderID;
    const n = args.join(" ").trim();
    const draw = args[0].toLowerCase() === "draw";
    const prompt = args[0].toLowerCase() === "prompt";
    const sendTikTok = args[0].toLowerCase() === "send";
    const sing = args[0].toLowerCase() === "sing";

    if (!n) {
      return message.reply("Please provide a prompt.");
    }

    if (draw) {
      await drawImage(message, n);
    } else if (prompt) {
      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const photoUrl = event.messageReply.attachments[0].url;
        const description = await describeImage(n, photoUrl);
        message.reply(`Description: ${description}`);
      } else {
        return message.reply("Please reply to an image to describe it.");
        }
    } else if (sendTikTok) {
      await kshitiz(api, event, args.slice(1), message); 
    } else if (sing) {
      await lado(api, event, args.slice(1), message); 
    } else {
      const q = await b(n, m);
      message.reply(q, (r, s) => {
        global.GoatBot.onReply.set(s.messageID, {
          commandName: a.name,
          uid: m 
        });
      });
    }
  } catch (t) {
    console.error("Error:", t.message);
    message.reply("An error occurred while processing the request.");
  }
}

async function drawImage(message, prompt) {
  try {
    const u = await i(prompt);

    const v = path.join(__dirname, 'cache', `image_${Date.now()}.png`);
    fs.writeFileSync(v, u);

    message.reply({
      body: "Generated image:",
      attachment: fs.createReadStream(v)
    });
  } catch (w) {
    console.error("Error:", w.message);
    message.reply("An error occurred while processing the request.");
  }
}

module.exports = {
  config: a,
  handleCommand: l,
  onStart: function ({ api, message, event, args }) {
    return l({ api, message, event, args });
  },
  onReply: function ({ api, message, event, args }) {
    return l({ api, message, event, args });
  }
};