
// // src/screens/ChatbotScreen.js
// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { colors, spacing, borderRadius, fontSize, fontWeight } from "../theme/colors";
// import { getPlantById } from "../data/plantsData";

// /**
//  * Chatbot that answers ONLY from the plantData record passed in route.params.plant
//  * - If a plant is passed, we extract fields (description, uses, leaves, warnings, etc.)
//  * - When user asks, we try to match keywords and return only that plant's info
//  * - No external API calls, free and deterministic
//  */

// export default function ChatbotScreen({ route, navigation }) {
//   const plant = route?.params?.plant || null;
//   const plantId = plant?.id || plant?.label || null;
//   // If plant param is just an id, pull full data:
//   const storedPlant = plant && plant.name ? plant : (plantId ? getPlantById(plantId) : null);

//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       from: "bot",
//       text: storedPlant
//         ? `Hi! I’m your plant assistant. Ask me anything about ${storedPlant.name}.`
//         : "Hi! I’m your plant assistant. Tell me the plant name or open detection first.",
//     },
//   ]);

//   const [input, setInput] = useState("");
//   const scrollRef = useRef();

//   useEffect(() => {
//     // scroll to bottom whenever messages change
//     scrollRef.current?.scrollToEnd({ animated: true });
//   }, [messages]);

//   const pushMessage = (from, text) => {
//     setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text }]);
//   };

//   function getAnswerFromPlant(plantObj, userText) {
//     // guard
//     if (!plantObj) return "I don't have data for this plant. Open detection first.";

//     const t = (userText || "").toLowerCase();

//     // keyword checks - map keywords to plant fields
//     const checks = [
//       {
//         keys: ["use", "uses", "used", "application", "applications"],
//         get: () => {
//           if (plantObj.uses) {
//             // join different uses present
//             const parts = [];
//             if (plantObj.uses.medicinal) parts.push(`Medicinal: ${plantObj.uses.medicinal.join(", ")}`);
//             if (plantObj.uses.culinary) parts.push(`Culinary: ${plantObj.uses.culinary.join(", ")}`);
//             if (plantObj.uses.other) parts.push(`${plantObj.uses.other}`);
//             if (parts.length) return parts.join(" · ");
//           }
//           return plantObj.uses && typeof plantObj.uses === "string" ? plantObj.uses : "No specific uses recorded.";
//         },
//       },
//       {
//         keys: ["leaves", "leaf", "shape", "vein", "arrangement"],
//         get: () => {
//           if (plantObj.leaves) {
//             const parts = [];
//             if (plantObj.leaves.characteristics) parts.push(plantObj.leaves.characteristics.join("; "));
//             if (plantObj.leaves.identification) parts.push(plantObj.leaves.identification);
//             return parts.join(" ");
//           }
//           return "Leaf information not available.";
//         },
//       },
//       {
//         keys: ["scientific", "scientific name", "botanical"],
//         get: () => plantObj.scientificName || "Scientific name not available.",
//       },
//       {
//         keys: ["accuracy", "typical accuracy", "model accuracy"],
//         get: () =>
//           typeof plantObj.modelAccuracy === "number"
//             ? `Typical model accuracy: ${plantObj.modelAccuracy}%`
//             : plantObj.modelAccuracy || "No typical accuracy recorded.",
//       },
//       {
//         keys: ["warning", "warnings", "toxic", "side effect", "caution"],
//         get: () => {
//           if (plantObj.warnings) return Array.isArray(plantObj.warnings) ? plantObj.warnings.join("; ") : plantObj.warnings;
//           return "No warnings recorded for this plant.";
//         },
//       },
//       {
//         keys: ["habitat", "native", "where", "grow", "grows"],
//         get: () => plantObj.habitat || plantObj.region || plantObj.shortDescription || plantObj.description || "Habitat information not available.",
//       },
//       {
//         keys: ["description", "about", "tell me", "what is", "who is"],
//         get: () => plantObj.detailedDescription || plantObj.description || "No description available.",
//       },
//     ];

//     // try to match highest-priority check by seeing if any of its keywords appear in user text
//     for (const c of checks) {
//       for (const k of c.keys) {
//         if (t.includes(k)) {
//           return c.get();
//         }
//       }
//     }

//     // If nothing matched, return a concise summary (only from plant data)
//     const summaryParts = [];
//     if (plantObj.description) summaryParts.push(plantObj.description);
//     if (plantObj.leaves && plantObj.leaves.characteristics) summaryParts.push("Leaves: " + plantObj.leaves.characteristics.slice(0, 4).join(", "));
//     if (plantObj.uses && plantObj.uses.medicinal) summaryParts.push("Uses: " + plantObj.uses.medicinal.slice(0, 4).join(", "));
//     const summary = summaryParts.join(" ");
//     return summary || "I couldn't find a direct answer in the plant data. Try asking about uses, leaves, scientific name, or warnings.";
//   }

//   const sendMessage = () => {
//     const text = input.trim();
//     if (!text) return;

//     // Add user message
//     pushMessage("user", text);
//     setInput("");

//     // Compute reply synchronously from plant data (free)
//     const reply = getAnswerFromPlant(storedPlant, text);
//     // ensure reply is short and from the plant data only
//     pushMessage("bot", reply);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Icon name="arrow-back" size={22} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Plant Assistant</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       Plant summary card
//       {storedPlant ? (
//         <View style={styles.plantCard}>
//           <Text style={styles.plantName}>{storedPlant.name}</Text>
//           {storedPlant.scientificName ? <Text style={styles.plantSci}>{storedPlant.scientificName}</Text> : null}
//           {storedPlant.description ? <Text style={styles.plantDesc}>{storedPlant.description.slice(0, 220)}{storedPlant.description.length > 220 ? "..." : ""}</Text> : null}
//         </View>
//       ) : (
//         <View style={[styles.plantCard, { justifyContent: "center" }]}>
//           <Text style={styles.plantName}>No plant data</Text>
//           <Text style={styles.plantDesc}>Open detection results first so I know which plant to answer about.</Text>
//         </View>
//       )}

//       {/* Chat area */}
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
//         <ScrollView ref={scrollRef} contentContainerStyle={styles.chatArea} showsVerticalScrollIndicator={false}>
//           {messages.map((m) => (
//             <View key={m.id} style={[styles.msgRow, m.from === "user" ? styles.msgRowUser : styles.msgRowBot]}>
//               <Text style={[styles.msgText, m.from === "user" ? styles.msgTextUser : styles.msgTextBot]}>{m.text}</Text>
//             </View>
//           ))}
//         </ScrollView>

//         <View style={styles.inputArea}>
//           <TextInput
//             value={input}
//             onChangeText={setInput}
//             placeholder="Ask about this plant (e.g. uses, leaves, warnings)..."
//             style={styles.input}
//             returnKeyType="send"
//             onSubmitEditing={sendMessage}
//           />
//           <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
//             <Icon name="send" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// /* ---------------------- STYLES ---------------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderLight,
//   },
//   backBtn: { padding: 6 },
//   headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.textPrimary },

//   plantCard: {
//     backgroundColor: colors.surface,
//     margin: spacing.lg,
//     padding: spacing.lg,
//     borderRadius: borderRadius.lg,
//     elevation: 2,
//   },
//   plantName: { fontSize: fontSize.xl, fontWeight: fontWeight.semiBold, color: colors.textPrimary },
//   plantSci: { fontSize: fontSize.md, fontStyle: "italic", color: colors.textSecondary, marginBottom: spacing.sm },
//   plantDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

//   chatArea: { padding: spacing.lg, paddingBottom: 20 },

//   msgRow: { maxWidth: "80%", marginBottom: 10, padding: 10, borderRadius: borderRadius.lg },
//   msgRowBot: { alignSelf: "flex-start", backgroundColor: colors.surface },
//   msgRowUser: { alignSelf: "flex-end", backgroundColor: colors.primaryLight },

//   msgText: { fontSize: fontSize.md, lineHeight: 20 },
//   msgTextBot: { color: colors.textPrimary },
//   msgTextUser: { color: colors.primaryDark },

//   inputArea: { flexDirection: "row", alignItems: "center", padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight, backgroundColor: colors.surface },
//   input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.borderLight },
//   sendBtn: { marginLeft: 8, backgroundColor: colors.primary, padding: 10, borderRadius: 10 },
// });













// src/screens/ChatbotScreen.js
// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { colors, spacing, borderRadius, fontSize, fontWeight } from "../theme/colors";
// import { getPlantById } from "../data/plantsData";

// /**
//  * Chatbot that queries the secure backend (which calls Hugging Face).
//  * If backend is unreachable, falls back to local deterministic answer getAnswerFromPlant.
//  *
//  * Set BACKEND_URL to your server (use HTTPS in production).
//  */
// const BACKEND_URL = "http://YOUR_SERVER_IP:3000"; // replace with your running server (or ngrok https url)

// export default function ChatbotScreen({ route, navigation }) {
//   const plant = route?.params?.plant || null;
//   const plantId = plant?.id || plant?.label || null;
//   const storedPlant = plant && plant.name ? plant : (plantId ? getPlantById(plantId) : null);

//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       from: "bot",
//       text: storedPlant
//         ? `Hi! I’m your plant assistant. Ask me anything about ${storedPlant.name}.`
//         : "Hi! I’m your plant assistant. Tell me the plant name or open detection first.",
//     },
//   ]);

//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const scrollRef = useRef();

//   useEffect(() => {
//     scrollRef.current?.scrollToEnd({ animated: true });
//   }, [messages]);

//   const pushMessage = (from, text) => {
//     setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text }]);
//   };

//   // Local deterministic answer (your original logic). Used as fallback.
//   function getAnswerFromPlant(plantObj, userText) {
//     if (!plantObj) return "I don't have data for this plant. Open detection first.";

//     const t = (userText || "").toLowerCase();

//     const checks = [
//       {
//         keys: ["use", "uses", "used", "application", "applications"],
//         get: () => {
//           if (plantObj.uses) {
//             const parts = [];
//             if (plantObj.uses.medicinal) parts.push(`Medicinal: ${plantObj.uses.medicinal.join(", ")}`);
//             if (plantObj.uses.culinary) parts.push(`Culinary: ${plantObj.uses.culinary.join(", ")}`);
//             if (plantObj.uses.other) parts.push(`${plantObj.uses.other}`);
//             if (parts.length) return parts.join(" · ");
//           }
//           return plantObj.uses && typeof plantObj.uses === "string" ? plantObj.uses : "No specific uses recorded.";
//         },
//       },
//       {
//         keys: ["leaves", "leaf", "shape", "vein", "arrangement"],
//         get: () => {
//           if (plantObj.leaves) {
//             const parts = [];
//             if (plantObj.leaves.characteristics) parts.push(plantObj.leaves.characteristics.join("; "));
//             if (plantObj.leaves.identification) parts.push(plantObj.leaves.identification);
//             return parts.join(" ");
//           }
//           return "Leaf information not available.";
//         },
//       },
//       {
//         keys: ["scientific", "scientific name", "botanical"],
//         get: () => plantObj.scientificName || "Scientific name not available.",
//       },
//       {
//         keys: ["accuracy", "typical accuracy", "model accuracy"],
//         get: () =>
//           typeof plantObj.modelAccuracy === "number"
//             ? `Typical model accuracy: ${plantObj.modelAccuracy}%`
//             : plantObj.modelAccuracy || "No typical accuracy recorded.",
//       },
//       {
//         keys: ["warning", "warnings", "toxic", "side effect", "caution"],
//         get: () => {
//           if (plantObj.warnings) return Array.isArray(plantObj.warnings) ? plantObj.warnings.join("; ") : plantObj.warnings;
//           return "No warnings recorded for this plant.";
//         },
//       },
//       {
//         keys: ["habitat", "native", "where", "grow", "grows"],
//         get: () => plantObj.habitat || plantObj.region || plantObj.shortDescription || plantObj.description || "Habitat information not available.",
//       },
//       {
//         keys: ["description", "about", "tell me", "what is", "who is"],
//         get: () => plantObj.detailedDescription || plantObj.description || "No description available.",
//       },
//     ];

//     for (const c of checks) {
//       for (const k of c.keys) {
//         if (t.includes(k)) {
//           return c.get();
//         }
//       }
//     }

//     const summaryParts = [];
//     if (plantObj.description) summaryParts.push(plantObj.description);
//     if (plantObj.leaves && plantObj.leaves.characteristics) summaryParts.push("Leaves: " + plantObj.leaves.characteristics.slice(0, 4).join(", "));
//     if (plantObj.uses && plantObj.uses.medicinal) summaryParts.push("Uses: " + plantObj.uses.medicinal.slice(0, 4).join(", "));
//     const summary = summaryParts.join(" ");
//     return summary || "I couldn't find a direct answer in the plant data. Try asking about uses, leaves, scientific name, or warnings.";
//   }

//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text) return;

//     pushMessage("user", text);
//     setInput("");
//     setLoading(true);

//     // Attempt to call backend proxy
//     try {
//       const resp = await fetch(`${BACKEND_URL}/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ plant: storedPlant || {}, message: text, max_tokens: 120 }),
//       });

//       if (!resp.ok) {
//         // fallback to local deterministic answer
//         const jsonErr = await resp.json().catch(() => ({}));
//         console.warn("Backend returned non-OK:", jsonErr);
//         const fallback = getAnswerFromPlant(storedPlant, text);
//         pushMessage("bot", fallback);
//         return;
//       }

//       const json = await resp.json();
//       let reply = null;
//       if (json?.reply) reply = json.reply;
//       else if (json?.raw) {
//         // try to extract common generated_text
//         if (Array.isArray(json.raw) && json.raw[0]?.generated_text) reply = json.raw[0].generated_text;
//         else reply = JSON.stringify(json.raw).slice(0, 800);
//       } else if (json?.error) {
//         console.warn("Model/backend error:", json.error);
//         reply = getAnswerFromPlant(storedPlant, text); // fallback
//       }

//       if (!reply) reply = "Sorry, I couldn't get a reply. Try again or check your network.";
//       pushMessage("bot", reply);
//     } catch (err) {
//       console.error("Network error, falling back to local answers:", err);
//       const fallback = getAnswerFromPlant(storedPlant, text);
//       pushMessage("bot", fallback);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Icon name="arrow-back" size={22} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Plant Assistant</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
//         <ScrollView ref={scrollRef} contentContainerStyle={styles.chatArea} showsVerticalScrollIndicator={false}>
//           {messages.map((m) => (
//             <View key={m.id} style={[styles.msgRow, m.from === "user" ? styles.msgRowUser : styles.msgRowBot]}>
//               <Text style={[styles.msgText, m.from === "user" ? styles.msgTextUser : styles.msgTextBot]}>{m.text}</Text>
//             </View>
//           ))}
//         </ScrollView>

//         <View style={styles.inputArea}>
//           <TextInput
//             value={input}
//             onChangeText={setInput}
//             placeholder="Ask about this plant (e.g. uses, leaves, warnings)..."
//             style={styles.input}
//             returnKeyType="send"
//             onSubmitEditing={sendMessage}
//             editable={!loading}
//           />
//           <TouchableOpacity onPress={sendMessage} style={styles.sendBtn} disabled={loading}>
//             <Icon name={loading ? "hourglass-top" : "send"} size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// /* ---------------------- STYLES ---------------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderLight,
//   },
//   backBtn: { padding: 6 },
//   headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.textPrimary },

//   chatArea: { padding: spacing.lg, paddingBottom: 20 },

//   msgRow: { maxWidth: "80%", marginBottom: 10, padding: 10, borderRadius: borderRadius.lg },
//   msgRowBot: { alignSelf: "flex-start", backgroundColor: colors.surface },
//   msgRowUser: { alignSelf: "flex-end", backgroundColor: colors.primaryLight },

//   msgText: { fontSize: fontSize.md, lineHeight: 20 },
//   msgTextBot: { color: colors.textPrimary },
//   msgTextUser: { color: colors.primaryDark },

//   inputArea: { flexDirection: "row", alignItems: "center", padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight, backgroundColor: colors.surface },
//   input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.borderLight },
//   sendBtn: { marginLeft: 8, backgroundColor: colors.primary, padding: 10, borderRadius: 10 },
// });






















// src/screens/ChatbotScreen.js
// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { colors, spacing, borderRadius, fontSize, fontWeight } from "../theme/colors";

// const CHATBOT_SERVER_URL = "http://192.168.1.8:5000/chat"; // 🔥 your backend chat API

// export default function ChatbotScreen({ route, navigation }) {
//   const plant = route?.params?.plant || null;
//   const detectedPlantName = route?.params?.detectedPlantName || plant?.name || "Unknown";

//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       from: "bot",
//       text: `Hi! I detected this leaf as "${detectedPlantName}". You can ask me about its medicinal uses, benefits, dosage, precautions, etc.`,
//     },
//   ]);

//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const scrollRef = useRef();

//   useEffect(() => {
//     scrollRef.current?.scrollToEnd({ animated: true });
//   }, [messages]);

//   const pushMessage = (from, text) => {
//     setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text }]);
//   };

//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text) return;

//     // user message
//     pushMessage("user", text);
//     setInput("");
//     setLoading(true);

//     try {
//       const response = await fetch(CHATBOT_SERVER_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           leafName: detectedPlantName,
//           message: text,
//         }),
//       });

//       const data = await response.json();
//       let reply = "Sorry, I couldn’t answer that right now.";

//       if (response.ok && data.reply) reply = data.reply;
//       pushMessage("bot", reply);
//     } catch (error) {
//       pushMessage(
//         "bot",
//         "Network error. Please ensure the chatbot server is running and your IP is correct."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Icon name="arrow-back" size={22} color={colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Leaf Chatbot</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {/* Chat area */}
//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
//         <ScrollView ref={scrollRef} contentContainerStyle={styles.chatArea} showsVerticalScrollIndicator={false}>
//           {messages.map((m) => (
//             <View key={m.id} style={[styles.msgRow, m.from === "user" ? styles.msgRowUser : styles.msgRowBot]}>
//               <Text style={[styles.msgText, m.from === "user" ? styles.msgTextUser : styles.msgTextBot]}>{m.text}</Text>
//             </View>
//           ))}

//           {loading && (
//             <View style={[styles.msgRow, styles.msgRowBot]}>
//               <ActivityIndicator />
//             </View>
//           )}
//         </ScrollView>

//         {/* Input */}
//         <View style={styles.inputArea}>
//           <TextInput
//             value={input}
//             onChangeText={setInput}
//             placeholder="Ask something about the leaf..."
//             style={styles.input}
//             returnKeyType="send"
//             onSubmitEditing={sendMessage}
//           />
//           <TouchableOpacity onPress={sendMessage} style={styles.sendBtn} disabled={loading}>
//             <Icon name="send" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// /* -------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.borderLight,
//   },
//   backBtn: { padding: 6 },
//   headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semiBold, color: colors.textPrimary },

//   chatArea: { padding: spacing.lg, paddingBottom: 20 },

//   msgRow: { maxWidth: "80%", marginBottom: 10, padding: 10, borderRadius: borderRadius.lg },
//   msgRowBot: { alignSelf: "flex-start", backgroundColor: colors.surface },
//   msgRowUser: { alignSelf: "flex-end", backgroundColor: colors.primaryLight },

//   msgText: { fontSize: fontSize.md, lineHeight: 20 },
//   msgTextBot: { color: colors.textPrimary },
//   msgTextUser: { color: colors.primaryDark },

//   inputArea: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: spacing.sm,
//     borderTopWidth: 1,
//     borderTopColor: colors.borderLight,
//     backgroundColor: colors.surface,
//   },
//   input: {
//     flex: 1,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//   },
//   sendBtn: { marginLeft: 8, backgroundColor: colors.primary, padding: 10, borderRadius: 10 },
// });







import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, 
  Platform, ActivityIndicator 
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

// VITAL STEP: REPLACE 'YOUR_COMPUTERS_IP_ADDRESS' below with the actual local IP 
// (e.g., 192.168.1.50) of the computer running your Node.js server.
const YOUR_IP_ADDRESS = '192.168.1.8'; // <--- UPDATE THIS LINE
const CHATBOT_SERVER_URL = 'http://' + YOUR_IP_ADDRESS + ':3000/api/chat'; 

const PRIMARY_COLOR = '#4CAF50';
const USER_BUBBLE_COLOR = PRIMARY_COLOR;
const BOT_BUBBLE_COLOR = '#E0E0E0'; // Light gray

// const ChatbotScreen = ({ route, navigation }) => {
//   // --- FIX APPLIED HERE ---
//   // The ChatbotScreen receives 'plantName' directly from DetectionResultsScreen.
//   // It should NOT try to access 'res' or 'plantData'.
//   const detectedPlant = route.params?.plantName || "Detected Plant";
//   // --- END FIX ---
const ChatbotScreen = ({ route, navigation }) => {
  const plantFromRoute = route?.params?.plant || null;
  const detectedPlant =
    route?.params?.plantName ||
    plantFromRoute?.name ||
    plantFromRoute?.label ||
    "Detected Plant";

  
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  // Initial system message to set the chatbot's persona and context
  const systemMessage = {
    role: "system",
    content: `You are a specialized, friendly, and helpful plant expert chatbot. Your sole purpose is to provide detailed, accurate, and concise information about the specific plant: "${detectedPlant}". If a user asks about any other topic or plant, politely redirect them, stating "I am only programmed to discuss the ${detectedPlant} plant. How can I help you with that?" Keep your responses under 200 words. Respond only with the assistant's content.`
  };

  useEffect(() => {
    // Initial bot greeting
    const initialGreeting = {
        id: Date.now(),
        role: 'assistant',
        text: `Hi! I detected this leaf as **${detectedPlant}**. You can ask me anything about its traditional uses, benefits, side effects, or cultivation.`,
    };
    setMessages([initialGreeting]);
  }, [detectedPlant]);

  const sendMessage = async () => {
    const userText = userInput.trim();
    if (!userText || isLoading) return;

    // Developer check for IP address placeholder
    if (YOUR_IP_ADDRESS === 'YOUR_COMPUTERS_IP_ADDRESS') {
        const errorMsg = { 
            id: Date.now(), 
            role: 'assistant', 
            text: 'ERROR: Please replace YOUR_COMPUTERS_IP_ADDRESS in ChatbotScreen.js with your machine\'s actual local IP address.',
        };
        setMessages(prevMessages => [...prevMessages, errorMsg]);
        return;
    }


    setIsLoading(true);
    setUserInput(''); // Clear input immediately
    
    // 1. Add user message to UI
    const newUserMessage = { id: Date.now(), role: 'user', text: userText };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    // 2. Prepare conversation history for API
    const apiMessages = [
        systemMessage,
        ...messages.slice(0).map(msg => ({ role: msg.role, content: msg.text })),
        { role: 'user', content: userText } // Add the current user query
    ];

    try {
        const response = await fetch(CHATBOT_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
            const errorStatus = response.status;
            let errorMessage = `Network error (Status: ${errorStatus}). Ensure server is running and IP is correct.`;
            if (errorStatus === 503) {
                errorMessage = "AI Service Error: Could not get a response from the Groq API.";
            } else if (errorStatus === 400) {
                errorMessage = "Bad Request: Check the message format sent to the server.";
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const botResponseText = data.text || "Sorry, I couldn't process that request.";

        // 3. Add bot message to UI
        const newBotMessage = { id: Date.now() + 1, role: 'assistant', text: botResponseText };
        setMessages(prevMessages => [...prevMessages, newBotMessage]);

    } catch (error) {
        console.error("Chatbot API Call Error:", error);
        const errorMessage = { 
          id: Date.now() + 1, 
          role: 'assistant', 
          text: `[Error: Failed to connect to server. Check server logs and URL: ${CHATBOT_SERVER_URL}]`,
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
        setIsLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderBubble = ({ item }) => {
    const isUser = item.role === 'user';
    const bubbleStyle = isUser ? styles.userBubble : styles.botBubble;
    const textStyle = isUser ? styles.userText : styles.botText;
    const alignment = isUser ? styles.userContainer : styles.botContainer;
    
    // Simple bold markdown conversion
    const formattedText = item.text.split('**').map((segment, index) => {
        if (index % 2 === 1) {
            return <Text key={index} style={styles.boldText}>{segment}</Text>;
        }
        return <Text key={index}>{segment}</Text>;
    });

    return (
      <View style={[styles.messageContainer, alignment]}>
        <View style={bubbleStyle}>
          <Text style={textStyle}>{formattedText}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {detectedPlant} Assistant
        </Text>
        <View style={{width: 30}}/>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderBubble}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Ask about ${detectedPlant}...`}
            placeholderTextColor="#888"
            value={userInput}
            onChangeText={setUserInput}
            onSubmitEditing={sendMessage}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage} 
            disabled={isLoading || userInput.trim() === ''}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  keyboardView: {
    flex: 1,
  },
  chatList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  userContainer: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  botContainer: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: USER_BUBBLE_COLOR,
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 2,
    elevation: 3,
  },
  botBubble: {
    backgroundColor: BOT_BUBBLE_COLOR,
    padding: 10,
    borderRadius: 15,
    borderBottomLeftRadius: 2,
    elevation: 3,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  botText: {
    color: '#333',
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 25,
  paddingHorizontal: 15,
  paddingVertical: 8,
  marginRight: 10,
  fontSize: 16,
  backgroundColor: '#fff',
  color: '#000',         // 👈 makes typed text visible
},
  sendButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: PRIMARY_COLOR,
  }
});

export default ChatbotScreen;