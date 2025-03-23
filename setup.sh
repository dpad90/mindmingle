#!/bin/bash

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Start the server
echo "Starting the server..."
echo "The application will be available at http://localhost:3000"
cd backend
npm start
