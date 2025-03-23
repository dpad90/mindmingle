const { io } = require("socket.io-client");

// Create three client sockets to simulate an asker and two discussers
const asker = io("http://localhost:3001");
const discusser1 = io("http://localhost:3001");
const discusser2 = io("http://localhost:3001");

const testQuestion = "What's your favorite movie and why?";

// Connection events
asker.on("connect", () => {
  console.log("Asker connected with ID:", asker.id);
  
  // Once connected, submit a question for spy mode
  console.log("Asker submitting question:", testQuestion);
  asker.emit("find_spy_match", { 
    role: "asker",
    question: testQuestion,
    interests: ["movies", "entertainment"] 
  });
});

discusser1.on("connect", () => {
  console.log("Discusser 1 connected with ID:", discusser1.id);
  
  // Add a slight delay before discusser 1 joins
  setTimeout(() => {
    console.log("Discusser 1 looking for a question to discuss...");
    discusser1.emit("find_spy_match", { 
      role: "discusser",
      interests: ["movies", "entertainment"] 
    });
  }, 1000);
});

discusser2.on("connect", () => {
  console.log("Discusser 2 connected with ID:", discusser2.id);
  
  // Add a slightly longer delay before discusser 2 joins
  setTimeout(() => {
    console.log("Discusser 2 looking for a question to discuss...");
    discusser2.emit("find_spy_match", { 
      role: "discusser",
      interests: ["movies", "books"] 
    });
  }, 2000);
});

// Spy mode match events
asker.on("spy_matched", (data) => {
  console.log("Asker: Spy mode session started with question:", data.question);
  console.log("Asker: Waiting for discussers to talk...");
});

discusser1.on("spy_matched", (data) => {
  console.log("Discusser 1: Matched with question:", data.question);
  
  // Send the first message in the discussion
  setTimeout(() => {
    console.log("Discusser 1 sending a message...");
    discusser1.emit("send_spy_message", { message: "I think my favorite movie is The Shawshank Redemption. The story is incredible!" });
  }, 1000);
});

discusser2.on("spy_matched", (data) => {
  console.log("Discusser 2: Matched with question:", data.question);
  
  // Send a response after discusser 1's message
  setTimeout(() => {
    console.log("Discusser 2 sending a message...");
    discusser2.emit("send_spy_message", { message: "Good choice! Mine is The Godfather because of the perfect direction and acting." });
  }, 3000);
});

// Message events
asker.on("spy_message", (data) => {
  console.log("Asker received:", data.from + ": " + data.message);
});

discusser1.on("spy_message", (data) => {
  console.log("Discusser 1 received:", data.from + ": " + data.message);
  
  // Reply to discusser 2
  if (data.from === "Stranger") {
    setTimeout(() => {
      console.log("Discusser 1 replying...");
      discusser1.emit("send_spy_message", { message: "I love The Godfather too! Have you seen Part II?" });
    }, 1000);
  }
});

discusser2.on("spy_message", (data) => {
  console.log("Discusser 2 received:", data.from + ": " + data.message);
  
  // Final reply
  if (data.message.includes("Part II")) {
    setTimeout(() => {
      console.log("Discusser 2 replying...");
      discusser2.emit("send_spy_message", { message: "Yes! Some say it's even better than the first one." });
    }, 1000);
  }
});

// Test content moderation
setTimeout(() => {
  console.log("Testing content moderation...");
  discusser1.emit("send_spy_message", { message: "Let's talk about badword1 in movies." });
}, 8000);

discusser1.on("message_filtered", (data) => {
  console.log("Discusser 1: Message was filtered. Original:", data.original, "Filtered:", data.filtered);
});

// Test disconnection after 15 seconds
setTimeout(() => {
  console.log("Test completed. Closing connections...");
  asker.disconnect();
  discusser1.disconnect();
  discusser2.disconnect();
  process.exit(0);
}, 15000);

// Error handling
asker.on("error", (data) => {
  console.log("Asker error:", data.message);
});

discusser1.on("error", (data) => {
  console.log("Discusser 1 error:", data.message);
});

discusser2.on("error", (data) => {
  console.log("Discusser 2 error:", data.message);
});

console.log("Spy Mode test script started. Simulating asker and discussers...");
