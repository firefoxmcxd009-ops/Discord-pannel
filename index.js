import { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, Routes } from "discord.js";
import { REST } from "discord.js";
import fetch from "node-fetch";
import express from "express";
import dotenv from "dotenv";

dotenv.config(); // 👈 LOAD ENV

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const SERVER_IP = "foxmckingdom.mcpc.ink";

// ================= EXPRESS (Render keep alive)
const app = express();
app.get("/", (req, res) => res.send("✅ Bot Running"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web server ready"));

// ================= DISCORD CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= FETCH SERVER
async function getData() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
    return await res.json();
  } catch {
    return null;
  }
}

// ================= STATUS EMBED
function createStatusEmbed(data) {
  if (data && data.online) {
    return new EmbedBuilder()
      .setTitle("🦊 Foxmc Kingdom")
      .setDescription("```fix\n🟢 ONLINE\n```")
      .addFields(
        { name: "👥 Players", value: `${data.players.online}/${data.players.max}`, inline: true },
        { name: "🌐 IP", value: SERVER_IP, inline: true }
      )
      .setColor(0x2ecc71)
      .setFooter({ text: "Updated: " + new Date().toLocaleTimeString() });
  } else {
    return new EmbedBuilder()
      .setTitle("🦊 Foxmc Kingdom")
      .setDescription("```diff\n- OFFLINE\n```")
      .setColor(0xe74c3c);
  }
}

// ================= LIST EMBED
function createListEmbed(data) {
  let desc = "";

  if (data?.players?.list?.length > 0) {
    desc = data.players.list.map(name => {
      const head = `https://crafthead.net/helm/${name}/32`;
      return `🧑 **${name}**\n${head}`;
    }).join("\n\n");
  } else {
    desc = "❌ គ្មានអ្នកលេង";
  }

  return new EmbedBuilder()
    .setTitle("👥 Player List")
    .setDescription(desc.substring(0, 4000))
    .setColor(0x3498db);
}

// ================= COMMANDS
const commands = [
  new SlashCommandBuilder().setName("status").setDescription("Show server status"),
  new SlashCommandBuilder().setName("list").setDescription("Show player list"),
  new SlashCommandBuilder().setName("support").setDescription("Support link"),
  new SlashCommandBuilder().setName("store").setDescription("Store link")
].map(cmd => cmd.toJSON());

// ================= REGISTER COMMANDS
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
  console.log("✅ Commands registered");
})();

// ================= INTERACTION
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const data = await getData();

  if (interaction.commandName === "status") {
    return interaction.reply({ embeds: [createStatusEmbed(data)] });
  }

  if (interaction.commandName === "list") {
    return interaction.reply({ embeds: [createListEmbed(data)] });
  }

  if (interaction.commandName === "support") {
    return interaction.reply({ content: "🆘 https://t.me/firefoxmc_xd" });
  }

  if (interaction.commandName === "store") {
    return interaction.reply({ content: "🛒 https://foxmcstatus.vercel.app" });
  }
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
