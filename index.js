import { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } from "discord.js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const SERVER_IP = "foxmckingdom.mcpc.ink";

// ================= EXPRESS (Render keep alive)
const app = express();
app.get("/", (req, res) => res.send("✅ Foxmc Bot Online"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Server running");
});

// ================= DISCORD CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= FETCH MC SERVER
async function getServer() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
    return await res.json();
  } catch {
    return null;
  }
}

// ================= EMBED STATUS
function statusEmbed(data) {
  if (data?.online) {
    return new EmbedBuilder()
      .setTitle("🦊 Foxmc Kingdom Status")
      .setDescription("```diff\n+ ONLINE\n```")
      .addFields(
        { name: "👥 Players", value: `${data.players.online}/${data.players.max}`, inline: true },
        { name: "🌐 IP", value: SERVER_IP, inline: true }
      )
      .setColor(0x2ecc71);
  } else {
    return new EmbedBuilder()
      .setTitle("🦊 Foxmc Kingdom Status")
      .setDescription("```diff\n- OFFLINE\n```")
      .setColor(0xe74c3c);
  }
}

// ================= PLAYER LIST
function listEmbed(data) {
  let list = "❌ No players online";

  if (data?.players?.list?.length > 0) {
    list = data.players.list.map(name => {
      const head = `https://crafthead.net/helm/${name}/32`;
      return `🧑 ${name}\n${head}`;
    }).join("\n\n");
  }

  return new EmbedBuilder()
    .setTitle("👥 Player List")
    .setDescription(list.slice(0, 4000))
    .setColor(0x3498db);
}

// ================= SLASH COMMANDS
const commands = [
  new SlashCommandBuilder().setName("status").setDescription("Server status"),
  new SlashCommandBuilder().setName("list").setDescription("Player list"),
  new SlashCommandBuilder().setName("support").setDescription("Support link"),
  new SlashCommandBuilder().setName("store").setDescription("Store link")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: commands
  });
  console.log("✅ Slash commands ready");
})();

// ================= INTERACTIONS
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const data = await getServer();

  if (interaction.commandName === "status") {
    return interaction.reply({ embeds: [statusEmbed(data)] });
  }

  if (interaction.commandName === "list") {
    return interaction.reply({ embeds: [listEmbed(data)] });
  }

  if (interaction.commandName === "support") {
    return interaction.reply("🆘 https://t.me/firefoxmc_xd");
  }

  if (interaction.commandName === "store") {
    return interaction.reply("🛒 https://foxmcstatus.vercel.app");
  }
});

// ================= READY
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
