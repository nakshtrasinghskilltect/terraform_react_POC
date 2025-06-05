

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const pty = require("node-pty");

const app = express();
const server = http.createServer(app);

// Enable CORS for HTTP routes
app.use(cors());

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",  // Your React frontend origin
    origin: "http://localhost:5173",  // Your React frontend origin
    methods: ["GET", "POST"],
  },
});

// Handle socket connection
io.on("connection", (socket) => {
  console.log("New client connected");

  const shell = process.platform === "win32" ? "powershell.exe" : "bash";
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  console.log("process.env.Home....",process.env.HOME);
  console.log("process.env....",process.env);
  console.log("process.platform....",process.platform);

  // Pipe data from terminal to client
  ptyProcess.on("data", (data) => {
    socket.emit("output", data);
  });

  // Pipe data from client to terminal
  socket.on("input", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    ptyProcess.kill();
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
