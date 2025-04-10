const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = async function generateImage(prompt) {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "png");

  const response = await axios.post(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    form,
    {
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        ...form.getHeaders(),
      },
      responseType: "arraybuffer", // critical for binary image
    }
  );

  const filePath = path.join(__dirname, "../output.png");
  fs.writeFileSync(filePath, response.data);

  return filePath;
};
