# Stranger Chat Architecture

This document outlines the architecture and design decisions for the Stranger Chat application, an Omegle-style random chat service.

## Overall Architecture

The application follows a client-server architecture with real-time communication:

```
[Client/Browser] <--WebSocket--> [Node.js Server] <--WebSocket--> [Client/Browser]
```

## Component Breakdown

### Frontend

The frontend is built with vanilla JavaScript, HTML, and CSS, with the following structure:

1. **HTML (index.html)**
   - Contains the static structure of the application
   - Defines UI elements for both the start screen and chat screen
   - Includes containers for regular chat and spy mode

2. **CSS (styles.css)**
   - Provides styling for all UI elements
   - Implements responsive design principles
   - Defines different message types and layouts

3. **JavaScript (app.js)**
   - Handles all client-side logic
   - Manages the connection to the server via Socket.IO
   - Controls the UI state based on user actions and server events
   - Processes and displays messages

### Backend

The backend is built with Node.js, Express, and Socket.IO:

1. **Server (server.js)**
   - Express server for serving the static frontend files
   - Socket.IO implementation for real-time communication
   - User matching logic for both regular chat and spy mode
   - Message routing between connected users

## Key Design Decisions

### WebSocket for Real-time Communication

Socket.IO (which uses WebSockets when available) was chosen for its:
- Real-time bidirectional communication
- Automatic fallback to other transport methods if WebSockets aren't available
- Built-in event system that makes message handling straightforward
- Support for reconnection and error handling

### User Matching System

The user matching system:
- Maintains separate queues for different chat modes
- Implements basic interest-based matching
- Handles the complex logic needed for spy mode (1 asker + 2 discussers)

### Spy Mode Implementation

Spy mode is implemented with a specialized structure:
- Questions are queued until 2 discussers are found
- A three-way connection is established (1 asker + 2 discussers)
- Messages are routed appropriately between parties
- The asker can see messages from both discussers, but discussers only see each other's messages

### Ephemeral Chats

All chats are ephemeral (not stored) for:
- Privacy reasons
- Simplicity of implementation
- Reduced server load and storage requirements

## Data Structures

### waitingUsers

```javascript
const waitingUsers = {
    text: [
        {
            socket: <socket.io_instance>,
            interests: ['music', 'movies', ...]
        },
        ...
    ],
    spy_discusser: [
        // Similar structure
    ]
};
```

### spyQuestions

```javascript
const spyQuestions = [
    {
        asker: <socket.io_instance>,
        question: "What's your favorite movie?",
        interests: ['movies', 'entertainment', ...],
        discussers: [<socket.io_instance>, <socket.io_instance>]
    },
    ...
];
```

### activeConnections

```javascript
const activeConnections = new Map();
// For text chat:
// key: socketId, value: { type: 'text', peers: [socketId] }

// For spy mode (asker):
// key: socketId, value: { type: 'spy_asker', peers: [discusser1Id, discusser2Id], question: "..." }

// For spy mode (discusser):
// key: socketId, value: { type: 'spy_discusser', peers: [askerId, otherDiscusserId], question: "..." }
```

## Message Flow

### Regular Chat

1. User A connects and waits in queue
2. User B connects and matches with User A
3. Both users are notified of the match
4. User A sends a message
   - Server routes the message to User B
5. User B sends a message
   - Server routes the message to User A

### Spy Mode

1. Asker submits a question and waits
2. Discusser 1 connects and waits with the question
3. Discusser 2 connects and completes the match
4. All parties are notified of the match
5. Discusser 1 sends a message
   - Server routes the message to Discusser 2 and the Asker (with "Stranger 1" label)
6. Discusser 2 sends a message
   - Server routes the message to Discusser 1 and the Asker (with "Stranger 2" label)
7. Asker only watches the conversation

## Scalability Considerations

While the current implementation is simple, here are some considerations for scaling:

1. **Horizontal Scaling**
   - The server could be replicated across multiple instances
   - A load balancer would distribute connections
   - Redis or another shared storage would be needed for the user queues

2. **Performance Optimizations**
   - Implement more efficient interest matching algorithms
   - Add rate limiting to prevent abuse
   - Consider WebRTC for direct peer-to-peer connections

3. **Additional Features**
   - User authentication (optional)
   - Content moderation
   - Reporting system
   - Video/audio chat integration
