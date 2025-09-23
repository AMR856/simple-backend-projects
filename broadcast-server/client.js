const { io } = require("socket.io-client");
const readline = require("readline");

const socket = io("http://localhost:3000");
const username = `User${process.pid}`;
let currentlyTypingUsers = [];
const basePrompt = "broadcast-room@";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


socket.on("connect", () => {
  console.log("Connected to server as", username);

  rl.setPrompt(basePrompt + username.replace(" ", "-") + "$> ");
  rl.prompt();

  rl.on("line", (line) => {
    socket.emit("chat message", { user: username, text: line });
    rl.prompt();
    socket.emit("stop typing", username);
  });
});

socket.on("typing", (user) => {console.log('Got here');
  if (user !== username && !currentlyTypingUsers.includes(user)) {
    currentlyTypingUsers.push(user);
  }
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  if (currentlyTypingUsers.length > 0) {
    console.log(`${currentlyTypingUsers.join(", ")} typing...`);
  }
  rl.prompt(true);
});

socket.on("stop typing", (user) => {
  currentlyTypingUsers = currentlyTypingUsers.filter(
    (arrayUser) => arrayUser !== user
  );
});

socket.on("chat message", (msg) => {
  if (msg.user !== username) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    console.log(`${msg.user}: ${msg.text}`);
    rl.write(rl.prompt.input);
    rl.prompt(true);
  }
});
