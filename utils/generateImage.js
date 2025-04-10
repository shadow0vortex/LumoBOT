const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = async function generateImage(prompt) {
  const response = await axios.post(
    "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/text-to-image",
    {
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 512,
      width: 512,
      samples: 1,
      steps: 30,
    },
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      },
    }
  );

  const base64Image = response.data.artifacts[0].base64;
  const filePath = path.join(__dirname, "../output.png");

  fs.writeFileSync(filePath, Buffer.from(base64Image, "base64"));
  return filePath;
};
