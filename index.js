require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const command = new SlashCommandBuilder()
  .setName("lumo")
  .setDescription("Generate an AI image from a prompt")
  .addStringOption(option =>
    option.setName("prompt")
      .setDescription("Your creative prompt")
      .setRequired(true)
  );

// Register slash command on bot ready
client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
  try {
    console.log("📡 Registering slash command...");
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: [command.toJSON()] }
    );
    console.log("✅ Slash command registered.");
  } catch (err) {
    console.error("⚠️ Error registering command:", err);
  }
});

// Handle the slash command interaction
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "lumo") {
    const prompt = interaction.options.getString("prompt");

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setDescription(`🎨 Generating your image with the prompt: **${prompt}**`)
      .setTitle("Lumo Image Generator")
      .setFooter({ text: "This may take a few moments..." })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    try {
      // Prepare form data for Stability API request
      const form = new FormData();
      form.append("prompt", prompt);
      form.append("output_format", "png");
      form.append("aspect_ratio", "1:1");
      form.append("model", "stable-diffusion-xl-1024-v1-0");

      // Make the API request
      const response = await axios.post(
        "https://api.stability.ai/v2beta/stable-image/generate/core",
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          },
          responseType: "arraybuffer",
        }
      );

      const buffer = Buffer.from(response.data);
      const filePath = path.join(__dirname, "lumo-output.png");
      fs.writeFileSync(filePath, buffer);

      // Prepare the success embed
      const successEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("Image Generated Successfully!")
        .setDescription(`Here is the image for your prompt: **${prompt}**`)
        .setImage("attachment://image.png")
        .setFooter({ text: "Generated by Lumo AI" })
        .setTimestamp();

      // Send the image to Discord with the success message
      await interaction.editReply({
        content: "✅ Here is your generated image:",
        embeds: [successEmbed],
        files: [{
          attachment: filePath,
          name: "image.png",
        }],
      });
    } catch (err) {
      const errData = err?.response?.data;
      const errorMsg = errData?.errors?.[0] || err.message;

      console.error("❌ Error from Stability API:", errData || err);

      const errorEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("❌ Error Generating Image")
        .setDescription(`Something went wrong. Here's the error: **${errorMsg}**`)
        .setFooter({ text: "Please try again later." })
        .setTimestamp();

      await interaction.editReply({
        embeds: [errorEmbed],
      });
    }
  }
});

// Log the bot into Discord
client.login(process.env.DISCORD_BOT_TOKEN);
