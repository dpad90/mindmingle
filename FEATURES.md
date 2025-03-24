# Features of MindMingle

## Core Functionality

### Chat Modes
1. **Regular Text Chat**
   - One-on-one random matching with strangers
   - Real-time messaging

2. **Question Mode**
   - Ask a question for two strangers to discuss
   - Join as a discusser to talk about a random question with another stranger
   - Asker can see both discussers' messages, but they can't directly participate

### Matching System
- Random matching based on availability
- Interest-based matching (optional)
- Users enter comma-separated interests for better matches

## Enhanced Features

### UI/UX
- **Dark Mode / Light Mode**
  - Toggle between dark and light themes
  - Preference saved in localStorage
  - Automatic theme preference restoration between sessions

- **Responsive Design**
  - Works well on mobile and desktop devices
  - Adaptive layout for different screen sizes

- **Status Indicators**
  - Connection status (connected, disconnected)
  - Typing indicators

### Chat Features
- **Typing Indicators**
  - Visual indicator when the stranger is typing
  - Automatic timeout after 2 seconds of inactivity

- **Emoji Support**
  - Emoji picker for quick insertion
  - Common emoji selection

- **Message Management**
  - Clear distinction between your messages and stranger messages
  - System messages for status updates
  - Special formatting for question mode messages

### Privacy & Moderation
- **Content Moderation**
  - Inappropriate content filtering
  - Word-based filtering system
  - Message length limits
  - Notification when content is filtered

- **Anonymity**
  - No user accounts required
  - No message history stored
  - No personal information shared

### Technical Features
- **Real-time Communication**
  - WebSocket connection via Socket.IO
  - Instant message delivery
  - Connection management

- **Disconnect Handling**
  - Graceful handling of disconnections
  - Notification when stranger disconnects
  - Ability to start a new chat

- **Resilient Operation**
  - Error handling
  - Connection recovery
  - User feedback for system events

## Planned Future Features

### Additional Chat Modes
- **Video Chat Mode**
  - WebRTC-based video communication
  - Camera and microphone controls

- **Group Chat Mode**
  - Chat with multiple strangers simultaneously
  - Topic-based group chats

### Enhanced Interaction
- **File Sharing**
  - Image sharing
  - Secure, temporary file uploads

- **Voice Messages**
  - Send audio clips

### Moderation & Safety
- **Advanced Content Moderation**
  - AI-based content filtering
  - Image moderation
  - User reporting system

- **Blocking System**
  - Block problematic users
  - IP-based restrictions

### Premium Features
- **Extended Matching Options**
  - Location-based matching
  - Language preferences
  - Advanced interest matching

- **Customization**
  - Custom themes
  - Message formatting options
  - Profile pictures (anonymous)
