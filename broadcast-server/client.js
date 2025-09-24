const readline = require("readline");
const { emitKeypressEvents } = require("readline");
const io = require("socket.io-client");

const socket = io("http://localhost:3000");
const username = `User${process.pid}`;
let currentlyTypingUsers = [];
const basePrompt = "broadcast-room@";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let typingTimeout;

emitKeypressEvents(process.stdin, rl);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

socket.on("connect", () => {
  console.log("Connected to server as", username);
  console.log("To exit press CTRL + C or type (exit || quit)");
  rl.setPrompt(basePrompt + username.replace(" ", "-") + "$> ");
  rl.prompt();

  process.stdin.on("keypress", () => {
    socket.emit("typing", username);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stop typing", username);
    }, 2500);
  });

  rl.on("line", (line) => {
    if (line.toLowerCase() === "exit" || line.toLowerCase() === "quit")
      process.exit(0);

    socket.emit("chat message", { user: username, text: line });
    typingTimeout = setTimeout(() =>{
      socket.emit("stop typing", username);
    }, 1000);
    rl.prompt(true);
  });
});

socket.on("typing", (user) => {
  if (user !== username && !currentlyTypingUsers.includes(user)) {
    currentlyTypingUsers.push(user);
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    console.log(`${currentlyTypingUsers.join(", ")} typing...`);
    rl.prompt(true);
  }
});

socket.on("stop typing", (user) => {
  currentlyTypingUsers = currentlyTypingUsers.filter(
    (arrayUser) => arrayUser !== user,
  );
});

socket.on("chat message", (msg) => {
  if (msg.user !== username) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    console.log(`${msg.user}: ${msg.text}`);
    rl.prompt(true);
  }
});
