const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const { filterMessage, validateMessage, validateQuestion } = require('./utils/moderation');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Queue for users waiting to be matched
const waitingUsers = {
    text: [],
    spy_discusser: []
};

// For spy mode askers waiting for two discussers
const spyQuestions = [];

// Active connections
const activeConnections = new Map();

// Function to find a match based on interests
function findMatch(socket, mode, interests = []) {
    if (waitingUsers[mode].length === 0) {
        waitingUsers[mode].push({
            socket,
            interests
        });
        return null;
    }

    // Simple interest matching (can be improved)
    let bestMatchIndex = 0;
    let bestMatchScore = -1;

    if (interests.length > 0) {
        for (let i = 0; i < waitingUsers[mode].length; i++) {
            const otherUser = waitingUsers[mode][i];
            if (otherUser.interests.length === 0) continue;

            let matchScore = 0;
            for (const interest of interests) {
                if (otherUser.interests.includes(interest)) {
                    matchScore++;
                }
            }

            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                bestMatchIndex = i;
            }
        }
    }

    const match = waitingUsers[mode].splice(bestMatchIndex, 1)[0];
    return match;
}

// Function to find or create a spy session
function findSpyMatch(socket, role, question = null, interests = []) {
    if (role === 'asker') {
        // Asker adds their question to the queue
        spyQuestions.push({
            asker: socket,
            question,
            interests,
            discussers: []
        });
        return;
    }

    // For discussers
    if (spyQuestions.length > 0) {
        // Find a question with one or zero discussers
        let bestQuestionIndex = -1;
        let bestMatchScore = -1;

        for (let i = 0; i < spyQuestions.length; i++) {
            const spySession = spyQuestions[i];
            if (spySession.discussers.length >= 2) continue;

            if (interests.length > 0 && spySession.interests.length > 0) {
                let matchScore = 0;
                for (const interest of interests) {
                    if (spySession.interests.includes(interest)) {
                        matchScore++;
                    }
                }

                if (matchScore > bestMatchScore) {
                    bestMatchScore = matchScore;
                    bestQuestionIndex = i;
                }
            } else if (bestQuestionIndex === -1) {
                bestQuestionIndex = i;
            }
        }

        if (bestQuestionIndex !== -1) {
            const spySession = spyQuestions[bestQuestionIndex];
            spySession.discussers.push(socket);

            // If we now have 2 discussers, start the spy session
            if (spySession.discussers.length === 2) {
                // Set up connections for all participants
                activeConnections.set(spySession.asker.id, {
                    type: 'spy_asker',
                    peers: [...spySession.discussers.map(s => s.id)],
                    question: spySession.question
                });

                for (const discusser of spySession.discussers) {
                    activeConnections.set(discusser.id, {
                        type: 'spy_discusser',
                        peers: [
                            spySession.asker.id,
                            ...spySession.discussers
                                .filter(s => s.id !== discusser.id)
                                .map(s => s.id)
                        ],
                        question: spySession.question
                    });
                }

                // Notify all participants
                spySession.asker.emit('spy_matched', {
                    question: spySession.question
                });

                for (const discusser of spySession.discussers) {
                    discusser.emit('spy_matched', {
                        question: spySession.question
                    });
                }

                // Remove the question from the queue
                spyQuestions.splice(bestQuestionIndex, 1);
                return;
            }
            
            return;
        }
    }

    // If no suitable question found, add to waiting queue
    waitingUsers.spy_discusser.push({
        socket,
        interests
    });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Find a match for text chat
    socket.on('find_match', (data) => {
        const { interests = [] } = data;
        const match = findMatch(socket, 'text', interests);

        if (match) {
            // Set up the connection between the two users
            activeConnections.set(socket.id, {
                type: 'text',
                peers: [match.socket.id]
            });

            activeConnections.set(match.socket.id, {
                type: 'text',
                peers: [socket.id]
            });

            // Notify both users they are matched
            socket.emit('matched');
            match.socket.emit('matched');
        }
    });

    // Find a match for spy mode
    socket.on('find_spy_match', (data) => {
        const { role, question, interests = [] } = data;
        
        // If it's an asker, validate their question with stricter validation
        if (role === 'asker' && question) {
            const validation = validateQuestion(question);
            if (!validation.isValid) {
                socket.emit('error', { message: validation.error });
                return;
            }
            
            // Filter inappropriate content in the question
            const { filtered, wasFiltered, reasons } = filterMessage(question);
            
            // Notify asker if their question was filtered
            if (wasFiltered) {
                socket.emit('message_filtered', {
                    original: question,
                    filtered: filtered,
                    reasons: reasons
                });
            }
            
            // Continue with the filtered question
            findSpyMatch(socket, role, filtered, interests);
        } else {
            findSpyMatch(socket, role, question, interests);
        }
    });

    // Handle regular messages
    socket.on('send_message', (data) => {
        const connection = activeConnections.get(socket.id);
        if (!connection) return;

        // Validate message
        const validation = validateMessage(data.message);
        if (!validation.isValid) {
            socket.emit('error', { message: validation.error });
            console.log(`Message rejected from ${socket.id}: ${validation.error}`);
            return;
        }

        // Filter inappropriate content
        const { filtered, wasFiltered, reasons } = filterMessage(data.message);
        
        // Notify sender if message was filtered
        if (wasFiltered) {
            socket.emit('message_filtered', {
                original: data.message,
                filtered: filtered,
                reasons: reasons
            });
            
            // Log filtered message for moderation purposes
            console.log(`Message filtered from ${socket.id}: ${reasons.join(', ')}`);
        }

        // Send message to all peers
        for (const peerId of connection.peers) {
            io.to(peerId).emit('message', {
                message: filtered
            });
        }
    });

    // Handle spy mode messages
    socket.on('send_spy_message', (data) => {
        const connection = activeConnections.get(socket.id);
        if (!connection || connection.type !== 'spy_discusser') return;

        // Validate message
        const validation = validateMessage(data.message);
        if (!validation.isValid) {
            socket.emit('error', { message: validation.error });
            console.log(`Question Mode message rejected from ${socket.id}: ${validation.error}`);
            return;
        }

        // Filter inappropriate content
        const { filtered, wasFiltered, reasons } = filterMessage(data.message);
        
        // Notify sender if message was filtered
        if (wasFiltered) {
            socket.emit('message_filtered', {
                original: data.message,
                filtered: filtered,
                reasons: reasons
            });
            
            // Log filtered message for moderation purposes
            console.log(`Question Mode message filtered from ${socket.id}: ${reasons.join(', ')}`);
        }

        // Send to all peers except the asker
        for (const peerId of connection.peers) {
            const peerConnection = activeConnections.get(peerId);
            if (peerConnection && peerConnection.type !== 'spy_asker') {
                io.to(peerId).emit('spy_message', {
                    from: 'Stranger',
                    message: filtered
                });
            }
        }

        // Send to asker with special formatting
        const askerPeerId = connection.peers.find(peerId => {
            const peerConn = activeConnections.get(peerId);
            return peerConn && peerConn.type === 'spy_asker';
        });

        if (askerPeerId) {
            io.to(askerPeerId).emit('spy_message', {
                from: connection.peers.indexOf(socket.id) === 0 ? 'Stranger 1' : 'Stranger 2',
                message: filtered
            });
        }
    });

    // Handle typing indicators
    socket.on('typing_started', () => {
        const connection = activeConnections.get(socket.id);
        if (!connection) return;

        // Notify all peers that this user is typing
        for (const peerId of connection.peers) {
            io.to(peerId).emit('stranger_typing');
        }
    });

    socket.on('typing_stopped', () => {
        const connection = activeConnections.get(socket.id);
        if (!connection) return;

        // Notify all peers that this user stopped typing
        for (const peerId of connection.peers) {
            io.to(peerId).emit('stranger_stopped_typing');
        }
    });

    // Handle disconnection
    socket.on('disconnect_chat', () => {
        handleDisconnect(socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        handleDisconnect(socket.id);
    });

    function handleDisconnect(socketId) {
        const connection = activeConnections.get(socketId);
        if (!connection) return;

        // Notify all peers that this user disconnected
        for (const peerId of connection.peers) {
            io.to(peerId).emit('stranger_disconnected');
            
            // Update peer's connection
            const peerConnection = activeConnections.get(peerId);
            if (peerConnection) {
                peerConnection.peers = peerConnection.peers.filter(id => id !== socketId);
                
                // If the peer has no more connections, they're effectively disconnected
                if (peerConnection.peers.length === 0) {
                    activeConnections.delete(peerId);
                }
            }
        }

        // Remove the connection
        activeConnections.delete(socketId);

        // Remove from waiting queues if applicable
        for (const mode in waitingUsers) {
            waitingUsers[mode] = waitingUsers[mode].filter(user => user.socket.id !== socketId);
        }

        // Remove from spy questions if applicable
        for (let i = spyQuestions.length - 1; i >= 0; i--) {
            const spySession = spyQuestions[i];
            
            // If the asker disconnected, remove the entire question
            if (spySession.asker.id === socketId) {
                // Notify discussers
                for (const discusser of spySession.discussers) {
                    discusser.emit('stranger_disconnected');
                }
                spyQuestions.splice(i, 1);
            } else {
                // If a discusser disconnected, remove them from the question
                spySession.discussers = spySession.discussers.filter(s => s.id !== socketId);
            }
        }
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
