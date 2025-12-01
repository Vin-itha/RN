// // C:\RN\chatbot-server\index.js
// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const fetch = require("node-fetch");

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const HF_API_KEY = process.env.HF_API_KEY;

// // You can change this to any public chat/text model on Hugging Face
// const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

// app.post("/chat", async (req, res) => {
//   try {
//     const userMessage = req.body.message || "";

//     if (!userMessage) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     // Simple prompt - you can tune this
//     const prompt = `
// You are a friendly assistant inside a plant leaf detection app.
// User message: "${userMessage}"
// Reply in short, simple English.
// `;

//     const response = await fetch(
//       `https://api-inference.huggingface.co/models/${HF_MODEL}`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${HF_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           inputs: prompt,
//           parameters: {
//             max_new_tokens: 200,
//             temperature: 0.7,
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("HF API error:", errorText);
//       return res.status(500).json({ error: "Hugging Face API error" });
//     }

//     const data = await response.json();

//     // For text-generation models, response is usually like: [{ generated_text: "..." }]
//     let botReply = "Sorry, I could not generate a reply.";

//     if (Array.isArray(data) && data[0] && data[0].generated_text) {
//       // Remove the original prompt part if needed
//       botReply = data[0].generated_text.replace(prompt, "").trim();
//     } else if (data.generated_text) {
//       botReply = data.generated_text.trim();
//     }

//     return res.json({ reply: botReply });
//   } catch (err) {
//     console.error("Server error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Chatbot server running on http://localhost:${PORT}`);
// });














// index.js
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const HF_API_KEY = process.env.HF_API_KEY;

// // 👉 Helper: call Hugging Face model
// async function askHuggingFace(prompt) {
//   const model = "meta-llama/Meta-Llama-3-8B-Instruct"; // or any chat/instruct model

//   const response = await axios.post(
//     `https://api-inference.huggingface.co/models/${model}`,
//     {
//       inputs: prompt,
//       parameters: {
//         max_new_tokens: 256,
//         temperature: 0.5,
//       },
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${HF_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   // HF returns an array with generated_text
//   const data = response.data;
//   if (Array.isArray(data) && data[0]?.generated_text) {
//   const full = data[0].generated_text;
//   // remove prompt from start if model repeats it
//   const cleaned = full.split("User question:").pop().trim();
//   return cleaned;
// }


//   // Fallback if format is slightly different
//   return JSON.stringify(data);
// }

// // 👉 Chat endpoint: accepts leafName + userMessage
// app.post("/chat", async (req, res) => {
//   try {
//     const { leafName, message } = req.body;

//     if (!message) {
//       return res.status(400).json({ error: "message is required" });
//     }

//     // If no leaf name, still respond, but better context if available
//     const leafInfo = leafName ? `The detected leaf is: ${leafName}.` : "";

//     const prompt = `
// You are an expert in medicinal plants. Always answer directly.
// The detected plant is: **${leafName}**.

// Rules:
// - Always give useful information even if the question is short like "uses", "benefits", "side effects", etc.
// - Never say "I don't know" or "I cannot answer".
// - If the question is not fully clear, still answer based on the plant's medicinal uses, benefits, dosage and precautions.
// - Answer only about **${leafName}**.
// - Give the answer in 4–7 simple bullet points.

// User question: ${message}
// `;


//     const rawText = await askHuggingFace(prompt);

//     // Sometimes generated_text includes the prompt. Try to keep only answer part.
//     // Very simple cleanup:
//     const reply = rawText.split("User question:").pop().trim();

//     res.json({ reply });
//   } catch (err) {
//     console.error("Chat error:", err?.response?.data || err.message);
//     res.status(500).json({
//       error: "Failed to get response from Hugging Face",
//     });
//   }
// });

// // Simple test
// app.get("/", (req, res) => {
//   res.send("Leaf chatbot server is running ✅");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Chatbot server running on http://192.168.1.8:${PORT}`);
// });















// // index.js
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const HF_API_KEY = process.env.HF_API_KEY;

// // 👉 Helper: call Hugging Face model
// async function askHuggingFace(prompt) {
//   if (!HF_API_KEY) {
//     throw new Error("HF_API_KEY is missing in .env");
//   }

//   // Use an open instruct/chat model
//   // If you want to try Llama again later, change this model.
//   const model = "tiiuae/falcon-7b-instruct";

//   try {
//     const response = await axios.post(
//       `https://api-inference.huggingface.co/models/${model}`,
//       {
//         inputs: prompt,
//         parameters: {
//           max_new_tokens: 320,
//           temperature: 0.4,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${HF_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 60000,
//       }
//     );

//     const data = response.data;

//     // Most common format: array with generated_text
//     if (Array.isArray(data) && data[0]?.generated_text) {
//       return data[0].generated_text;
//     }

//     // Some models may return plain string or object
//     if (typeof data === "string") return data;
//     if (data.generated_text) return data.generated_text;

//     return JSON.stringify(data);
//   } catch (err) {
//     console.error(
//       "HF error:",
//       err.response?.status,
//       err.response?.data || err.message
//     );
//     const msg =
//       err.response?.data?.error ||
//       err.message ||
//       "Unknown error from Hugging Face";
//     throw new Error(msg);
//   }
// }

// // 👉 Chat endpoint: accepts leafName + userMessage
// app.post("/chat", async (req, res) => {
//   try {
//     const { leafName, message } = req.body;

//     if (!message) {
//       return res.status(400).json({ error: "message is required" });
//     }

//     const safeLeafName = leafName || "this plant";

//     const prompt = `
// You are an expert in medicinal plants.

// The detected leaf is: ${safeLeafName}.

// RULES:
// - Always give useful information even if the question is just one word like "uses", "benefits", "side effects".
// - Focus on: medicinal uses, health benefits, dosage / preparation methods, precautions and side effects for ${safeLeafName}.
// - Answer ONLY about ${safeLeafName}.
// - Use clear, simple English.
// - Reply in 4–7 bullet points.
// - Do NOT say "I don't know" or "I cannot answer". If not sure, give the best safe general information.

// User question: ${message}
// `;

//     const rawText = await askHuggingFace(prompt);

//     // Sometimes the model echoes the prompt. Keep only the part after "User question:"
//     let reply = rawText;
//     if (rawText.includes("User question:")) {
//       reply = rawText.split("User question:").pop().trim();
//     }

//     return res.json({ reply });
//   } catch (err) {
//     console.error("Chat error:", err.message);
//     return res.status(500).json({
//       error: `Failed to get response from Hugging Face: ${err.message}`,
//     });
//   }
// });

// // Simple test
// app.get("/", (req, res) => {
//   res.send("Leaf chatbot server is running ✅");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Chatbot server running on port ${PORT}`);
// });




const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000; // Choose a port for your backend server

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

// ✅ Add this:
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
  console.log(`Chatbot server running at http://localhost:${port}`);
  console.log("-----------------------------------------");
  console.log("Remember to run 'npm install' in the chatbot-server folder first!");
});