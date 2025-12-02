// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   View, Text, TextInput, TouchableOpacity, 
//   StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, 
//   Platform, ActivityIndicator 
// } from 'react-native';
// import Icon from "react-native-vector-icons/MaterialIcons";

// // VITAL STEP: REPLACE 'YOUR_COMPUTERS_IP_ADDRESS' below with the actual local IP 
// // (e.g., 192.168.1.50) of the computer running your Node.js server.
// //const YOUR_IP_ADDRESS = '192.168.1.8'; // <--- UPDATE THIS LINE
// //const CHATBOT_SERVER_URL = 'http://' + YOUR_IP_ADDRESS + ':3000/api/chat'; 
// const CHATBOT_SERVER_URL = "https://leaf-chatbot-server.onrender.com/api/chat";


// const PRIMARY_COLOR = '#4CAF50';
// const USER_BUBBLE_COLOR = PRIMARY_COLOR;
// const BOT_BUBBLE_COLOR = '#E0E0E0'; // Light gray

// // const ChatbotScreen = ({ route, navigation }) => {
// //   // --- FIX APPLIED HERE ---
// //   // The ChatbotScreen receives 'plantName' directly from DetectionResultsScreen.
// //   // It should NOT try to access 'res' or 'plantData'.
// //   const detectedPlant = route.params?.plantName || "Detected Plant";
// //   // --- END FIX ---
// const ChatbotScreen = ({ route, navigation }) => {
//   const plantFromRoute = route?.params?.plant || null;
//   const detectedPlant =
//     route?.params?.plantName ||
//     plantFromRoute?.name ||
//     plantFromRoute?.label ||
//     "Detected Plant";

  
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const flatListRef = useRef(null);

//   // Initial system message to set the chatbot's persona and context
//   const systemMessage = {
//     role: "system",
//     content: `You are a specialized, friendly, and helpful plant expert chatbot. Your sole purpose is to provide detailed, accurate, and concise information about the specific plant: "${detectedPlant}". If a user asks about any other topic or plant, politely redirect them, stating "I am only programmed to discuss the ${detectedPlant} plant. How can I help you with that?" Keep your responses under 200 words. Respond only with the assistant's content.`
//   };

//   useEffect(() => {
//     // Initial bot greeting
//     const initialGreeting = {
//         id: Date.now(),
//         role: 'assistant',
//         text: `Hi! I detected this leaf as **${detectedPlant}**. You can ask me anything about its traditional uses, benefits, side effects, or cultivation.`,
//     };
//     setMessages([initialGreeting]);
//   }, [detectedPlant]);

//   const sendMessage = async () => {
//     const userText = userInput.trim();
//     if (!userText || isLoading) return;

//     // Developer check for IP address placeholder
//     // if (YOUR_IP_ADDRESS === 'YOUR_COMPUTERS_IP_ADDRESS') {
//     //     const errorMsg = { 
//     //         id: Date.now(), 
//     //         role: 'assistant', 
//     //         text: 'ERROR: Please replace YOUR_COMPUTERS_IP_ADDRESS in ChatbotScreen.js with your machine\'s actual local IP address.',
//     //     };
//     //     setMessages(prevMessages => [...prevMessages, errorMsg]);
//     //     return;
//     // }


//     setIsLoading(true);
//     setUserInput(''); // Clear input immediately
    
//     // 1. Add user message to UI
//     const newUserMessage = { id: Date.now(), role: 'user', text: userText };
//     setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
//     // 2. Prepare conversation history for API
//     const apiMessages = [
//         systemMessage,
//         ...messages.slice(0).map(msg => ({ role: msg.role, content: msg.text })),
//         { role: 'user', content: userText } // Add the current user query
//     ];

//     try {
//         const response = await fetch(CHATBOT_SERVER_URL, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ messages: apiMessages }),
//         });

//         if (!response.ok) {
//             const errorStatus = response.status;
//             let errorMessage = `Network error (Status: ${errorStatus}). Ensure server is running and IP is correct.`;
//             if (errorStatus === 503) {
//                 errorMessage = "AI Service Error: Could not get a response from the Groq API.";
//             } else if (errorStatus === 400) {
//                 errorMessage = "Bad Request: Check the message format sent to the server.";
//             }
//             throw new Error(errorMessage);
//         }

//         const data = await response.json();
//         const botResponseText = data.text || "Sorry, I couldn't process that request.";

//         // 3. Add bot message to UI
//         const newBotMessage = { id: Date.now() + 1, role: 'assistant', text: botResponseText };
//         setMessages(prevMessages => [...prevMessages, newBotMessage]);

//     } catch (error) {
//         console.error("Chatbot API Call Error:", error);
//         const errorMessage = { 
//           id: Date.now() + 1, 
//           role: 'assistant', 
//           text: `[Error: Failed to connect to server. Check server logs and URL: ${CHATBOT_SERVER_URL}]`,
//         };
//         setMessages(prevMessages => [...prevMessages, errorMessage]);
//     } finally {
//         setIsLoading(false);
//         setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//     }
//   };

//   const renderBubble = ({ item }) => {
//     const isUser = item.role === 'user';
//     const bubbleStyle = isUser ? styles.userBubble : styles.botBubble;
//     const textStyle = isUser ? styles.userText : styles.botText;
//     const alignment = isUser ? styles.userContainer : styles.botContainer;
    
//     // Simple bold markdown conversion
//     const formattedText = item.text.split('**').map((segment, index) => {
//         if (index % 2 === 1) {
//             return <Text key={index} style={styles.boldText}>{segment}</Text>;
//         }
//         return <Text key={index}>{segment}</Text>;
//     });

//     return (
//       <View style={[styles.messageContainer, alignment]}>
//         <View style={bubbleStyle}>
//           <Text style={textStyle}>{formattedText}</Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//              <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           {detectedPlant} Assistant
//         </Text>
//         <View style={{width: 30}}/>
//       </View>

//       <KeyboardAvoidingView 
//         style={styles.keyboardView}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//       >
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderBubble}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.chatList}
//           onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//         />

//         {isLoading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="small" color={PRIMARY_COLOR} />
//             <Text style={styles.loadingText}>AI is thinking...</Text>
//           </View>
//         )}

//         <View style={styles.inputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder={`Ask about ${detectedPlant}...`}
//             placeholderTextColor="#888"
//             value={userInput}
//             onChangeText={setUserInput}
//             onSubmitEditing={sendMessage}
//             editable={!isLoading}
//           />
//           <TouchableOpacity 
//             style={styles.sendButton} 
//             onPress={sendMessage} 
//             disabled={isLoading || userInput.trim() === ''}
//           >
//             <Icon name="send" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     backgroundColor: PRIMARY_COLOR,
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   backButton: {
//     padding: 5,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   chatList: {
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//   },
//   messageContainer: {
//     flexDirection: 'row',
//     marginVertical: 4,
//   },
//   userContainer: {
//     justifyContent: 'flex-end',
//     alignSelf: 'flex-end',
//     maxWidth: '80%',
//   },
//   botContainer: {
//     justifyContent: 'flex-start',
//     alignSelf: 'flex-start',
//     maxWidth: '80%',
//   },
//   userBubble: {
//     backgroundColor: USER_BUBBLE_COLOR,
//     padding: 10,
//     borderRadius: 15,
//     borderBottomRightRadius: 2,
//     elevation: 3,
//   },
//   botBubble: {
//     backgroundColor: BOT_BUBBLE_COLOR,
//     padding: 10,
//     borderRadius: 15,
//     borderBottomLeftRadius: 2,
//     elevation: 3,
//   },
//   userText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   botText: {
//     color: '#333',
//     fontSize: 16,
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     alignItems: 'center',
//   },
//   input: {
//   flex: 1,
//   borderWidth: 1,
//   borderColor: '#ccc',
//   borderRadius: 25,
//   paddingHorizontal: 15,
//   paddingVertical: 8,
//   marginRight: 10,
//   fontSize: 16,
//   backgroundColor: '#fff',
//   color: '#000',         // 👈 makes typed text visible
// },
//   sendButton: {
//     backgroundColor: PRIMARY_COLOR,
//     borderRadius: 25,
//     width: 45,
//     height: 45,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//   },
//   loadingText: {
//     marginLeft: 8,
//     color: PRIMARY_COLOR,
//   }
// });

// export default ChatbotScreen;








import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, 
  Platform, ActivityIndicator 
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

const CHATBOT_SERVER_URL = "https://leaf-chatbot-server.onrender.com/api/chat";

const PRIMARY_COLOR = '#4CAF50';
const USER_BUBBLE_COLOR = PRIMARY_COLOR;
const BOT_BUBBLE_COLOR = '#E0E0E0'; // Light gray

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
        <View style={{ width: 30 }} />
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
            {/* ➤ send symbol */}
            <Text style={styles.sendIcon}>➤</Text>
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
    color: '#000',
  },
  sendButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
