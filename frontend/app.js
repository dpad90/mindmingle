document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const chatScreen = document.getElementById('chat-screen');
    const textChatBtn = document.getElementById('text-chat-btn');
    const questionModeBtn = document.getElementById('spy-mode-btn');
    const questionOptions = document.getElementById('spy-options');
    const askQuestionBtn = document.getElementById('ask-question-btn');
    const discussQuestionBtn = document.getElementById('discuss-question-btn');
    const questionInput = document.getElementById('spy-question-input');
    const questionInput = document.getElementById('question-input');
    const submitQuestionBtn = document.getElementById('submit-question-btn');
    const interestsInput = document.getElementById('interests-input');
    const startChatBtn = document.getElementById('start-chat-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const chatMessages = document.getElementById('chat-messages');
    const spyModeContainer = document.getElementById('spy-mode-container');
    const questionDisplay = document.getElementById('question-display');
    const spyMessages = document.getElementById('spy-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const strangerStatus = document.getElementById('stranger-status');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const typingIndicator = document.getElementById('typing-indicator');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');

    // State variables
    let socket;
    let chatMode = 'question'; // 'text' or 'question'
    let questionRole = ''; // 'asker' or 'discusser'
    let strangerConnected = false;
    let currentQuestion = '';
    let typingTimeout;
    let isTyping = false;
    let darkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize socket connection
    function initSocket() {
        socket = io('http://localhost:3001');

        // Socket events
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('matched', () => {
            strangerConnected = true;
            strangerStatus.textContent = 'Stranger connected';
            addSystemMessage('You are now chatting with a stranger!');
        });

        socket.on('spy_matched', (data) => {
            strangerConnected = true;
            strangerStatus.textContent = '🔮 Question Mode: Connected 🔮';
            
            if (spyRole === 'asker') {
                addSystemMessage('Two strangers are now discussing your question');
            } else {
                currentQuestion = data.question;
                questionDisplay.textContent = `Question: ${currentQuestion}`;
                addSystemMessage('You are now discussing a question with another stranger');
            }
        });

        socket.on('message', (data) => {
            hideTypingIndicator();
            addStrangerMessage(data.message);
        });

        socket.on('spy_message', (data) => {
            hideTypingIndicator();
            addSpyMessage(data.from, data.message);
        });

        socket.on('stranger_typing', () => {
            showTypingIndicator();
        });

        socket.on('stranger_stopped_typing', () => {
            hideTypingIndicator();
        });

        socket.on('message_filtered', (data) => {
            addSystemMessage('Your message contained inappropriate content and was filtered.');
        });

        socket.on('stranger_disconnected', () => {
            strangerConnected = false;
            strangerStatus.textContent = 'Stranger has disconnected';
            addSystemMessage('Stranger has disconnected');
            hideTypingIndicator();
            disableChatInput();
        });

        socket.on('error', (data) => {
            addSystemMessage(`Error: ${data.message}`);
        });
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        
        // Scroll to show the typing indicator
        if (chatMode === 'question' && questionRole === 'discusser') {
            spyMessages.scrollTop = spyMessages.scrollHeight;
        } else {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    // Mode selection
    textChatBtn.addEventListener('click', () => {
        chatMode = 'text';
        textChatBtn.classList.add('active');
        questionModeBtn.classList.remove('active');
        questionOptions.classList.add('hidden');
    });

    questionModeBtn.addEventListener('click', () => {
        chatMode = 'question';
        questionModeBtn.classList.add('active');
        textChatBtn.classList.remove('active');
        questionOptions.classList.remove('hidden');
    });

    // Question mode options
    askQuestionBtn.addEventListener('click', () => {
        questionRole = 'asker';
        askQuestionBtn.classList.add('active');
        discussQuestionBtn.classList.remove('active');
        questionInput.classList.remove('hidden');
    });

    discussQuestionBtn.addEventListener('click', () => {
        questionRole = 'discusser';
        discussQuestionBtn.classList.add('active');
        askQuestionBtn.classList.remove('active');
        questionInput.classList.add('hidden');
    });

    // Start chat
    startChatBtn.addEventListener('click', () => {
        if (chatMode === 'question' && questionRole === '') {
            addSystemMessage('Please select a Question Mode option');
            return;
        }

        if (chatMode === 'question' && questionRole === 'asker' && !questionInput.value.trim()) {
            addSystemMessage('Please enter a question');
            return;
        }

        startScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');

        initSocket();
        
        const interests = interestsInput.value.trim() ? 
            interestsInput.value.split(',').map(i => i.trim()) : [];

        if (chatMode === 'text') {
            socket.emit('find_match', { interests });
        } else if (chatMode === 'question') {
            if (questionRole === 'asker') {
                currentQuestion = questionInput.value.trim();
                spyModeContainer.classList.remove('hidden');
                questionDisplay.textContent = `Your question: ${currentQuestion}`;
                socket.emit('find_spy_match', { 
                    role: questionRole,
                    question: currentQuestion,
                    interests
                });
            } else {
                spyModeContainer.classList.remove('hidden');
                socket.emit('find_spy_match', { 
                    role: questionRole,
                    interests
                });
            }
        }
    });

    // Chat functionality
    sendBtn.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        } else if (strangerConnected && !isTyping) {
            isTyping = true;
            socket.emit('typing_started');
            
            // Clear any existing timeout
            clearTimeout(typingTimeout);
            
            // Set a new timeout for when typing stops
            typingTimeout = setTimeout(() => {
                isTyping = false;
                socket.emit('typing_stopped');
            }, 2000);
        }
    });
    
    // Add typing stopped event when focus is lost
    chatInput.addEventListener('blur', () => {
        if (isTyping) {
            clearTimeout(typingTimeout);
            isTyping = false;
            socket.emit('typing_stopped');
        }
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || !strangerConnected) return;

        if (chatMode === 'text') {
            socket.emit('send_message', { message });
            addYourMessage(message);
        } else if (chatMode === 'question' && questionRole === 'discusser') {
            socket.emit('send_spy_message', { message });
            addYourMessage(message);
        }

        chatInput.value = '';
    }

    // New chat / Disconnect
    newChatBtn.addEventListener('click', () => {
        if (socket) {
            socket.disconnect();
        }
        resetChat();
        startScreen.classList.remove('hidden');
        chatScreen.classList.add('hidden');
        spyModeContainer.classList.add('hidden');
    });

    disconnectBtn.addEventListener('click', () => {
        if (socket) {
            socket.emit('disconnect_chat');
            socket.disconnect();
        }
        disableChatInput();
        strangerStatus.textContent = 'Disconnected';
        addSystemMessage('You have disconnected');
    });

    // Helper functions
    function addYourMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'you');
        messageElement.textContent = message;
        
        if (chatMode === 'spy' && spyRole === 'discusser') {
            spyMessages.appendChild(messageElement);
            spyMessages.scrollTop = spyMessages.scrollHeight;
        } else {
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function addStrangerMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'stranger');
        messageElement.textContent = message;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addSpyMessage(from, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'spy');
        messageElement.textContent = `${from}: ${message}`;
        
        spyMessages.appendChild(messageElement);
        spyMessages.scrollTop = spyMessages.scrollHeight;
    }

    function addSystemMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'system');
        messageElement.textContent = message;
        
        if (chatMode === 'question' && (questionRole === 'discusser' || questionRole === 'asker')) {
            spyMessages.appendChild(messageElement);
            spyMessages.scrollTop = spyMessages.scrollHeight;
        } else {
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function disableChatInput() {
        chatInput.disabled = true;
        sendBtn.disabled = true;
    }

    function enableChatInput() {
        chatInput.disabled = false;
        sendBtn.disabled = false;
    }

    function resetChat() {
        chatMessages.innerHTML = '';
        spyMessages.innerHTML = '';
        questionDisplay.textContent = '';
        strangerStatus.textContent = 'Connecting to a stranger...';
        strangerConnected = false;
        isTyping = false;
        clearTimeout(typingTimeout);
        hideTypingIndicator();
        emojiPicker.classList.add('hidden');
        enableChatInput();
    }

    // Initial state
    questionModeBtn.classList.add('active');
    questionOptions.classList.remove('hidden');
    
    // Theme toggle functionality
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        if (isDarkMode) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });
    
    // Emoji picker functionality
    const emojis = ['😊', '😂', '😍', '🤔', '😎', '👍', '❤️', '👋', '🎉', '🔥', '👏', '🙏', '😁', '😉', '🤣', '😋', '😡', '😢', '🥰', '😮'];
    
    // Populate emoji picker
    emojis.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.classList.add('emoji-btn');
        emojiButton.textContent = emoji;
        emojiButton.addEventListener('click', () => {
            chatInput.value += emoji;
            emojiPicker.classList.add('hidden');
            chatInput.focus();
        });
        emojiPicker.appendChild(emojiButton);
    });
    
    emojiBtn.addEventListener('click', () => {
        emojiPicker.classList.toggle('hidden');
    });
    
    // Hide emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
            emojiPicker.classList.add('hidden');
        }
    });
});
