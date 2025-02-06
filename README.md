# NeuroGPT: A React-based Chat UI with Firebase Integration

NeuroGPT is a modern, feature-rich chat application built with React and Firebase. It provides a seamless and interactive chat experience with real-time message synchronization, user authentication, and a responsive user interface.

The application offers a range of features including markdown support for messages, theme customization, chat history management, and integration with a custom webhook for message processing. NeuroGPT is designed to be easily extensible and customizable, making it suitable for various chat-based applications.

## Repository Structure

```
.
├── package.json
├── public
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── README.md
└── src
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── reportWebVitals.js
    └── setupTests.js
```

### Key Files:
- `src/App.js`: The main component containing the chat UI logic and Firebase integration.
- `package.json`: Defines project dependencies and scripts.
- `public/manifest.json`: Web app manifest for PWA support.

## Usage Instructions

### Installation

Prerequisites:
- Node.js (v14 or later)
- npm (v6 or later)

To install the project dependencies, run:

```bash
npm install
```

### Getting Started

1. Set up a Firebase project and obtain the configuration details.

2. Replace the Firebase configuration in `src/App.js` with your own:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "XXXXXXXXXXXXXXXXXXX",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

3. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Configuration Options

- Webhook URL: Update the `webhookURL` variable in `src/App.js` to point to your message processing endpoint.
- User Authentication: Modify the `users` array in `src/App.js` to manage authorized users.

### Common Use Cases

1. Sending a message:
   - Type your message in the input field.
   - Press Enter or click the send button.

   Input:
   ```
   Hello, NeuroGPT!
   ```

   Output:
   ```
   User: Hello, NeuroGPT!
   Bot: Hello! How can I assist you today?
   ```

2. Changing themes:
   - Click the theme button (sun icon) in the sidebar.
   - Select "Light", "Dark", or "System" from the dropdown.

3. Starting a new chat session:
   - Click the new session button (pencil icon) in the sidebar.

### Testing & Quality

To run the test suite:

```bash
npm test
```

### Troubleshooting

1. Issue: Firebase initialization fails
   - Error message: "Firebase: Error (auth/invalid-api-key)."
   - Diagnostic process:
     1. Check if the Firebase configuration in `src/App.js` is correct.
     2. Verify that the Firebase project is properly set up in the Firebase Console.
   - Solution: Update the Firebase configuration with the correct values from your Firebase project settings.

2. Issue: Webhook connection fails
   - Error message: "Failed to connect to the webhook. Status: 404"
   - Diagnostic process:
     1. Check if the `webhookURL` in `src/App.js` is correct.
     2. Verify that the webhook server is running and accessible.
   - Solution: Update the `webhookURL` with the correct endpoint or ensure the webhook server is operational.

### Debugging

To enable verbose logging:

1. In `src/index.js`, uncomment the `reportWebVitals` function call:

```javascript
reportWebVitals(console.log);
```

2. Open the browser's developer tools (F12) and check the console for detailed performance metrics and errors.

Log files are not applicable for this client-side application. All debugging information will be available in the browser's console.

### Performance Optimization

- Monitor network requests in the browser's Network tab to identify slow API calls.
- Use React DevTools to profile component rendering and identify performance bottlenecks.
- Implement lazy loading for chat history to improve initial load times for users with extensive chat logs.

## Data Flow

The NeuroGPT application follows a unidirectional data flow pattern. Here's an overview of how data moves through the application:

1. User Input -> React State
2. React State -> Firebase Firestore (for persistence)
3. Firebase Firestore -> React State (for real-time updates)
4. User Input -> Webhook (for message processing)
5. Webhook -> React State (for displaying responses)

```
+-------------+     +-------------------+     +--------------------+
|  User Input |---->| React Application |<--->| Firebase Firestore |
+-------------+     +-------------------+     +--------------------+
                            |  ^
                            |  |
                            v  |
                    +----------------+
                    | Webhook Server |
                    +----------------+
```

Note: The application uses React hooks (useState, useEffect) for state management and side effects, ensuring efficient updates and re-renders.