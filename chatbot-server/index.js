const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

// Load environment variables from .env file
dotenv.config();

const app = express();
//const port = 3000; // Choose a port for your backend server

// ✅ In cloud we must use PORT from env
const port = process.env.PORT || 3000;

// Initialize Groq SDK with the API key from the environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
  console.error("FATAL ERROR: GROQ_API_KEY is not set in the .env file.");
  process.exit(1);
}
const groq = new Groq({ apiKey: GROQ_API_KEY });

// Middleware setup
app.use(cors()); // Allows your React Native app to connect
app.use(express.json()); // Parses incoming JSON payloads

//  Add this:
app.get('/', (req, res) => {
  res.send('Leaf chatbot server is running ✅');
});

// Main Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' format in request body." });
    }

    // Call the Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant", // Fast and capable model
      temperature: 0.5,
      max_tokens: 500,
    });

    // Send the AI's response back to the client
    const botResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't get a response from the AI.";

    res.json({ text: botResponse });

  } catch (error) {
    console.error("Error processing chat request:", error);
    res.status(500).json({ error: "Internal server error during Groq API call." });
  }
});

app.listen(port, () => {
  // console.log(`Chatbot server running at http://localhost:${port}`);
  console.log(`Chatbot server running on port ${port}`);
  console.log("-----------------------------------------");
  console.log("Remember to run 'npm install' in the chatbot-server folder first!");
});