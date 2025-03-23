const { io } = require("socket.io-client");

// Create two client sockets to simulate two users
const user1 = io("http://localhost:3001");
const user2 = io("http://localhost:3001");

// User connection events
user1.on("connect", () => {
  console.log("User 1 connected with ID:", user1.id);
  
  // Once connected, attempt to find a match
  console.log("User 1 searching for a match...");
  user1.emit("find_match", { interests: ["movies", "games"] });
});

user2.on("connect", () => {
  console.log("User 2 connected with ID:", user2.id);
  
  // Add a slight delay before user 2 searches for a match
  setTimeout(() => {
    console.log("User 2 searching for a match...");
    user2.emit("find_match", { interests: ["games", "music"] });
  }, 1000);
});

// Match events
user1.on("matched", () => {
  console.log("User 1 matched with someone!");
  
  // Send a test message
  setTimeout(() => {
    console.log("User 1 sending a message...");
    user1.emit("send_message", { message: "Hello from User 1!" });
  }, 1000);
});

user2.on("matched", () => {
  console.log("User 2 matched with someone!");
  
  // Send a test message
  setTimeout(() => {
    console.log("User 2 sending a message...");
    user2.emit("send_message", { message: "Hi from User 2!" });
  }, 2000);
});

// Message events
user1.on("message", (data) => {
  console.log("User 1 received:", data.message);
});

user2.on("message", (data) => {
  console.log("User 2 received:", data.message);
});

// Test typing indicators
user1.on("stranger_typing", () => {
  console.log("User 1 sees: Stranger is typing...");
});

user2.on("stranger_typing", () => {
  console.log("User 2 sees: Stranger is typing...");
});

// Simulate typing indicator
setTimeout(() => {
  console.log("User 1 starts typing...");
  user1.emit("typing_started");
  
  // Stop typing after 2 seconds
  setTimeout(() => {
    console.log("User 1 stops typing...");
    user1.emit("typing_stopped");
  }, 2000);
}, 4000);

// Test disconnection after 10 seconds
setTimeout(() => {
  console.log("User 1 disconnecting...");
  user1.emit("disconnect_chat");
  
  // Make sure we get the disconnect event on user 2
  setTimeout(() => {
    console.log("Test completed. Closing connections...");
    user1.disconnect();
    user2.disconnect();
    process.exit(0);
  }, 1000);
}, 10000);

// Error handling
user1.on("error", (data) => {
  console.log("User 1 error:", data.message);
});

user2.on("error", (data) => {
  console.log("User 2 error:", data.message);
});

// Disconnect events
user1.on("stranger_disconnected", () => {
  console.log("User 1: Stranger has disconnected");
});

user2.on("stranger_disconnected", () => {
  console.log("User 2: Stranger has disconnected");
});

console.log("Test script started. Simulating 2 users connecting to the chat...");
