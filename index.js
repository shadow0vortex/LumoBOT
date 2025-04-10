const generateImage = require("./utils/generateImage");

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!lumo") || message.author.bot) return;

  const prompt = message.content.replace("!lumo", "").trim();
  if (!prompt) {
    return message.reply("📝 Provide a prompt. Example: `!lumo futuristic samurai`");
  }

  try {
    const imagePath = await generateImage(prompt);
    message.channel.send({
      content: `🎨 Prompt: ${prompt}`,
      files: [imagePath]
    });
  } catch (error) {
    console.error(error);
    message.reply("❌ Failed to generate image.");
  }
});
