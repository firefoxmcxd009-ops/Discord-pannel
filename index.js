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
const DEFAULT_SKIN_ID = "a30601e36d52e1dea9bf3f4eadccf7f00eec305b792702b8bd96fc8a439317fd";

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

// ================= 3D PLAYER HEAD LOGIC
function getHead(name, playersCount) {
  if (playersCount > 0 && name) {
    // បើមានអ្នកលេង ប្រើ Crafthead ដើម្បី Support Java/Bedrock
    return `https://crafthead.net/helm/${name}/64`;
  } else {
    // បើគ្មានអ្នកលេង ប្រើ Custom Texture ID ដែលអ្នកផ្ដល់ឱ្យ (បង្ហាញជា 3D Head)
    return `https://visage.surgeplay.com/head/64/${DEFAULT_SKIN_ID}`;
  }
}

// ================= BOT READY
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= COMMAND !panel
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "!panel") {
    await msg.channel.sendTyping();

    const data = await getStatus();

    // ❌ Server Offline
    if (!data || !data.online) {
      const offlineEmbed = new EmbedBuilder()
        .setTitle("sᴇʀᴠᴇʀ ɪs ᴏғғʟɪɴᴇ!")
        .setDescription("sᴇʀᴠᴇʀ ɪs ᴄᴜʀʀᴇɴᴛʟʏ ᴏғғʟɪɴᴇ ᴏʀ ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ.")
        .setThumbnail(`https://visage.surgeplay.com/head/64/${DEFAULT_SKIN_ID}`) // បង្ហាញក្បាលដដែលពេល Offline
        .setColor("Red")
        .setTimestamp();

      return msg.channel.send({ embeds: [offlineEmbed] });
    }

    // 👥 Players Logic
    const players = data.players?.list || [];
    const list = players.length
      ? players.map(p => `★ ${p}`).join("\n")
      : "ɴᴏ ᴘʟᴀយᴇʀs ᴏɴʟɪɴᴇ";

    // 🎮 EMBED
    const embed = new EmbedBuilder()
      .setTitle("ғᴏxᴍᴄᴋɪɴɢᴅᴏᴍ ʟɪᴠᴇ ᴘᴀɴᴇʟ")
      .setDescription("**ʟɪᴠᴇ ᴘʟᴀʏers ʟɪsᴛ:**\n" + (list.length > 1000 ? list.substring(0, 1000) + "..." : list))
      .addFields(
        { name: "♙ ᴏɴʟɪɴᴇ", value: `\`${data.players.online}/${data.players.max}\``, inline: true },
        { name: "⌘ ᴠᴇʀsɪᴏɴ", value: `\`${data.version || "Unknown"}\``, inline: true },
        { name: "❀ ɪᴘ", value: `\`${SERVER}\``, inline: false },
        { name: "⊟ ᴘᴏʀᴛ", value: `\`${data.port || "25565"}\``, inline: true }
      )
      // កែសម្រួល Thumbnail តាមលក្ខខណ្ឌរបស់អ្នក
      .setThumbnail(getHead(players[0], players.length))
      .setColor("#5865F2")
      .setFooter({ text: "ʀᴇǫᴜᴇsᴛᴇᴅ ᴘᴀɴᴇʟ • ғᴏxᴍᴄᴋɪɴɢᴅᴏᴍ ʙᴏᴛ" })
      .setTimestamp();

    msg.channel.send({ embeds: [embed] });
  }
});

// ================= LOGIN
client.login(TOKEN);
      
