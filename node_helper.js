const NodeHelper = require("node_helper")
const OpenAI = require("openai");
const fs = require("fs");
const speech = require("@google-cloud/speech");


module.exports = NodeHelper.create({

  start: function() {
    console.log("Starting node_helper for: " + this.name);
    this.openai = new OpenAI({
      apiKey: "",
      // baseURL: "https://api.deepseek.com/v1",
    });
    this.speechClient = new speech.SpeechClient({
      keyFilename: "",
    });
  },

  async socketNotificationReceived(notification, payload) {
    if (notification === "SPEECH_TO_TEXT") {
      const text = await this.convertSpeechToText(payload.filePath)
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }],
      });
      this.sendSocketNotification("SPEECH_TO_TEXT_RESULT", { text: response.choices[0].message.content })
    }
  },

  async convertSpeechToText(filePath) {
    try {
      const audio = {
        content: fs.readFileSync(filePath).toString("base64"), // Convert file to base64
      };
  
      const config = {
        encoding: "LINEAR16", // WAV files typically use LINEAR16
        sampleRateHertz: 16000, // Ensure your file is 16kHz
        languageCode: "en-US", // Change for other languages
      };
  
      console.log("Sending audio to Google Cloud...");
      const [response] = await this.speechClient.recognize({ audio, config });
  
      if (response.results.length > 0) {
        return response.results.map(r => r.alternatives[0].transcript).join(" ")
      } else {
        console.log("No speech detected.");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
})
