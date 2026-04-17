const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const express = require("express");

// ================= EXPRESS (RENDER REQUIRED)
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

let lastMessage = null;

// ================= GET SERVER STATUS
async function getStatus() {
  try {
    const res = await axios.get(`https://api.mcsrvstat.us/2/${SERVER}`);
    return res.data;
  } catch (err) {
    return null;
  }
}

// ================= PLAYER HEAD
function getHead(name) {
  return `https://mc-heads.net/avatar/${name}/64`;
}

// ================= BOT READY
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= COMMAND !panel
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "!panel") {
    const channel = msg.channel;

    async function updatePanel() {
      const data = await getStatus();

      // ❌ Server Offline
      if (!data || !data.online) {
        const offlineEmbed = new EmbedBuilder()
          .setTitle("🔴 Server Offline")
          .setDescription("Server is currently offline")
          .setColor("Red");

        if (lastMessage) {
          return lastMessage.edit({ embeds: [offlineEmbed] });
        } else {
          lastMessage = await channel.send({ embeds: [offlineEmbed] });
        }
        return;
      }

      // 👥 Players
      const players = data.players?.list || [];

      const list = players.length
        ? players.map(p => `🎮 ${p.name}`).join("\n")
        : "No players online";

      // 🎮 EMBED DESIGN
      const embed = new EmbedBuilder()
        .setTitle("🎮 Minecraft Live Server Panel")
        .setDescription("**Live Player List:**\n" + list)
        .addFields(
          { name: "👥 Online", value: `${data.players.online}`, inline: true },
          { name: "📊 Max", value: `${data.players.max}`, inline: true },
          { name: "⚙️ Version", value: data.version || "Unknown", inline: true }
        )
        .setThumbnail(players[0] ? getHead(players[0].name) : null)
        .setColor("Green")
        .setFooter({ text: "Auto Updated Every 30s • Render Hosted Bot" });

      // 🔄 EDIT MESSAGE (NO SPAM)
      if (lastMessage) {
        await lastMessage.edit({ embeds: [embed] });
      } else {
        lastMessage = await channel.send({ embeds: [embed] });
      }
    }

    // first run
    updatePanel();

    // auto update
    setInterval(updatePanel, 30000);
  }
});

// ================= LOGIN
client.login(TOKEN);
