import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import './App.css';
import { FiSend, FiUpload, FiEdit, FiSun } from "react-icons/fi"; // Import required icons
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";

// Firebase configuration (replace with your own)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const users = [
  { username: "Kartik", password: "password1" },
  { username: "Debajyoti", password: "password2" },
  { username: "Debarka", password: "password3" },
  { username: "Aman", password: "password4" },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem("username", user.username); // Save username to localStorage
      onLogin(user.username);
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>NeuroGPT</h1>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

function ChatTriggerUI() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // User state for login
  const [chatHistory, setChatHistory] = useState([]); // Store past conversations
  const [selectedSession, setSelectedSession] = useState(null); // State for selected session
  const [theme, setTheme] = useState("light"); // State for theme
  const [showSignOut, setShowSignOut] = useState(false); // State for sign-out button

  const webhookURL = "https://podhealthn8n.4gd.ai/prod/v1/f5c457b1-c6ba-48b3-8933-1628f97412ce/chat";

  // Load chat history from Firestore when the component mounts
  useEffect(() => {
    const q = query(collection(db, "chatHistory"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatHistory(history);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Check localStorage for username when the component mounts
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUser(savedUsername);
    }
  }, []);

  // Handle theme change
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const sendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message!");
      return;
    }

    const newMessage = { type: "user", text: message };
    setConversation([...conversation, newMessage]);
    setLoading(true);

    try {
      const res = await fetch(webhookURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: message,
          sessionId: "unique-session-id",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to connect to the webhook. Status: ${res.status}, Error: ${errorText}`);
      }

      const data = await res.json();
      const newResponse = { type: "bot", text: data.output || "No response from the agent" };
      setConversation([...conversation, newMessage, newResponse]);

      // Save the conversation to Firestore
      await addDoc(collection(db, "chatHistory"), {
        messages: [...conversation, newMessage, newResponse],
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const errorResponse = { type: "bot", text: `Error: ${error.message}` };
      setConversation([...conversation, newMessage, errorResponse]);
    } finally {
      setLoading(false);
    }

    setMessage("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("username");
    setUser(null);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleNewSession = () => {
    if (window.confirm("Are you sure you want to close and start a new session?")) {
      setConversation([]);
      setSelectedSession(null);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="chat-header">
          <h1>NeuroGPT</h1>
        </div>
        <div className="chat-history">
          {selectedSession ? (
            selectedSession.messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <strong>{msg.type === "user" ? "You:" : "Response:"}</strong>
                <ReactMarkdown className="prose">{msg.text}</ReactMarkdown>
              </div>
            ))
          ) : (
            conversation.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <strong>{msg.type === "user" ? "You:" : "Response:"}</strong>
                <ReactMarkdown className="prose">{msg.text}</ReactMarkdown>
              </div>
            ))
          )}
          {loading && (
            <div className="message bot">
              <strong>Response:</strong>
              <div className="simple-loader"></div>
            </div>
          )}
        </div>
        <div className="chat-input">
  <textarea
    rows="1"
    placeholder="Type your message here..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        sendMessage(); // Send message on Enter key press
      }
    }}
    onInput={(e) => {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
  />
  <div className="chat-buttons">
    <button className="send-button" onClick={sendMessage}>
      <FiSend size={23}/> {/* Send icon */}
    </button>
    <div className="vertical-line"></div>
    <button className="upload-button">
      <FiUpload size={23} /> {/* Upload icon */}
    </button>
  </div>
</div>
      </div>
      <div className="chat-sidebar">
        <div className="header-buttons">
          <button className="new-session-button" onClick={handleNewSession}>
            <FiEdit size={20} /> {/* Pencil icon for new session */}
          </button>
          <div className="theme-dropdown">
            <button className="theme-button">
              <FiSun size={20} /> {/* Theme icon */}
            </button>
            <div className="theme-options">
              <button onClick={() => handleThemeChange("light")}>Light</button>
              <button onClick={() => handleThemeChange("dark")}>Dark</button>
              <button onClick={() => handleThemeChange("system")}>System</button>
            </div>
          </div>
          <button className="profile-button" onClick={() => setShowSignOut(!showSignOut)}>
            {user.charAt(0).toUpperCase()} {/* First letter of the username */}
          </button>
          {showSignOut && (
            <button className="sign-out-button" onClick={handleSignOut}>
              Sign Out
            </button>
          )}
        </div>
        <h2>Chat History</h2>
        {chatHistory.map((session) => (
          <div key={session.id} className="session" onClick={() => setSelectedSession(session)}>
            <strong>{session.messages[0].text.split(" ").slice(0, 5).join(" ")}</strong>
            <small>{new Date(session.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatTriggerUI;