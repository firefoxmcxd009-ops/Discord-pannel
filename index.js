const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const express = require("express");

// ================= EXPRESS (KEEP-ALIVE FOR RENDER)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Minecraft Bot Running on Render");
});

app.listen(PORT, () => {
  console.log("Web server running on port " + PORT);
});

// ================= DISCORD BOT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const SERVER = "foxmckingdom.mcpc.ink";

// ================= GET SERVER STATUS
async function getStatus() {
  try {
    const response = await axios.get(`https://api.mcsrvstat.us/2/${SERVER}`);
    return response.data;
  } catch (err) {
    console.error("API Error:", err.message);
    return null;
  }
}

// ================= PLAYER HEAD
function getHead(name) {
  // ប្រើ Crafthead ដើម្បីឱ្យ Support ទាំង Java & Bedrock
  return `https://crafthead.net/helm/${name}/128`;
}

// ================= BOT READY
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= COMMAND !panel
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "!panel") {
    // បង្ហាញថា Bot កំពុងគិត (Typing status)
    await msg.channel.sendTyping();

    const data = await getStatus();

    // ❌ Server Offline ឬ Error
    if (!data || !data.online) {
      const offlineEmbed = new EmbedBuilder()
        .setTitle("sᴇʀᴠᴇʀ ɪs ᴏғғʟɪɴᴇ!")
        .setDescription("sᴇʀᴠᴇʀ ɪs ᴄᴜʀʀᴇɴᴛʟʏ ᴏғғʟɪɴᴇ ᴏʀ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ.")
        .setColor("Red");

      return msg.channel.send({ embeds: [offlineEmbed] });
    }

    // 👥 Players Logic
    const players = data.players?.list || [];
    const list = players.length
      ? players.map(p => `★ ${p}`).join("\n")
      : "ɴᴏ ᴘʟᴀʏᴇʀs ᴏɴʟɪɴᴇ";

    // 🎮 EMBED
    const embed = new EmbedBuilder()
      .setTitle("ғᴏxᴍᴄᴋɪɴɢᴅᴏᴍ ʟɪᴠᴇ ᴘᴀɴᴇʟ")
      .setDescription("**ʟɪᴠᴇ ᴘʟាយer ʟɪsᴛ:**\n" + (list.length > 1000 ? list.substring(0, 1000) + "..." : list))
      .addFields(
        { name: "♙ ᴏɴʟɪɴᴇ", value: `\`${data.players.online}/${data.players.max}\``, inline: true },
        { name: "⌘ ᴠᴇʀsɪᴏɴ", value: `\`${data.version || "Unknown"}\``, inline: true },
        { name: "❀ ɪᴘ", value: `\`${SERVER}\``, inline: false },
        { name: "⊟ ᴘᴏʀᴛ", value: `\`${data.port || "25565"}\``, inline: true }
      )
      .setThumbnail(players.length > 0 ? getHead(players[0]) : "https://mc-heads.net/avatar/Steve")
      .setColor("#5865F2")
      .setFooter({ text: "ʀᴇǫᴜᴇsᴛᴇᴅ ᴘᴀɴᴇʟ • ғᴏxᴍᴄᴋɪɴɢᴅᴏᴍ ʙᴏᴛ" })
      .setTimestamp();

    // 🔥 SEND MESSAGE
    msg.channel.send({ embeds: [embed] });
  }
});

// ================= LOGIN
client.login(TOKEN);
