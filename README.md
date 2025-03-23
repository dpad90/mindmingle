# Stranger Chat - Omegle Style Website

A comprehensive random chat application similar to Omegle, complete with text chat and Spy Mode functionality.

## Features

- **Random Text Chat**: Get matched with a random stranger for a one-on-one conversation
- **Spy Mode**: Two options:
  - Ask a question and watch two strangers discuss it
  - Discuss a question asked by a stranger with another stranger
- **Interest-based Matching**: Add your interests for better matching with like-minded individuals
- **Simple User Interface**: Clean, intuitive interface that's easy to use
- **Real-time Communication**: Instant messaging with WebSocket technology

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/stranger-chat.git
   cd stranger-chat
   ```

2. Install the backend dependencies:
   ```
   cd backend
   npm install
   ```

## Running the Application

1. Start the server:
   ```
   cd backend
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Use

### Text Chat

1. On the home page, select "Text Chat"
2. Optionally, add your interests separated by commas (for better matching)
3. Click "Start Chatting"
4. Wait to be matched with a stranger
5. Start chatting!

### Spy Mode

#### To Ask a Question:
1. Select "Spy Mode"
2. Choose "Ask a Question"
3. Type your question
4. Click "Start Chatting"
5. Wait for two strangers to be matched
6. Watch their conversation about your question

#### To Discuss a Question:
1. Select "Spy Mode"
2. Choose "Discuss a Question"
3. Click "Start Chatting"
4. Wait to be matched with another stranger and to receive a question
5. Discuss the question with the other stranger

## Notes and Limitations

- The matching system is simple and based on basic interest comparison
- There is no moderation system, so be mindful of content
- No video or audio chat functionality (text only)
- No persistence - all chats are ephemeral and not stored

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Omegle
- Built with Socket.IO for real-time communication
