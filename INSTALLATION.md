# Installation Guide for Stranger Chat

This guide will walk you through setting up and running the Stranger Chat application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Git (optional, for cloning the repository)

## Installation Steps

### 1. Get the Code

Either clone the repository using Git:

```bash
git clone https://github.com/yourusername/stranger-chat.git
cd stranger-chat
```

Or download and extract the ZIP file from the repository.

### 2. Install Dependencies

Navigate to the backend directory and install the required dependencies:

```bash
cd omegle-clone/backend
npm install
```

This will install:
- Express (web server)
- Socket.IO (real-time communication)
- CORS (Cross-Origin Resource Sharing support)

### 3. Start the Server

While still in the backend directory, start the server:

```bash
npm start
```

You should see the message: `Server running on port 3000`

### 4. Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

The application should now be running and ready to use!

## Running with the Setup Script

For convenience, you can also use the included setup script:

1. Make the script executable (Unix/Linux/macOS):
   ```bash
   chmod +x setup.sh
   ```

2. Run the script:
   ```bash
   ./setup.sh
   ```

This script will install the dependencies and start the server automatically.

## Troubleshooting

### Port Already in Use

If you see an error like `Error: listen EADDRINUSE: address already in use :::3000`, it means port 3000 is already being used by another application.

To use a different port, you can:

1. Set the PORT environment variable before starting:
   ```bash
   PORT=3001 npm start
   ```

2. Or modify the server.js file to use a different port.

### WebSocket Connection Issues

If you're seeing connection issues:

1. Make sure no firewall is blocking WebSocket connections
2. Verify that the server is running
3. Check browser console for any error messages

## Development Mode

For development with automatic restart on file changes:

```bash
npm run dev
```

This uses nodemon to watch for changes and restart the server automatically.

## Next Steps

After installation, you can:

1. Test the application by opening two different browser windows to simulate two users
2. Explore the code to understand how it works
3. Modify or extend the functionality as needed

For more details about the features of the application, see [FEATURES.md](FEATURES.md).
