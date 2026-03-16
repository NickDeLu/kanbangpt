// const WebSocket = require("ws");

// const ws = new WebSocket("ws://localhost:3000");

// ws.on("open", () => {

//   console.log("Connected to KanbanGPT");

//   ws.send(JSON.stringify({
//     type: "userMessage",
//     text: "create a project called AI Startup"
//   }));

// });

// ws.on("message", (data) => {

//   const msg = JSON.parse(data.toString());

//   console.log("SERVER:", msg);

// });

// ws.on("close", () => {
//   console.log("Disconnected");
// });
const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

let fullMessage = "";

ws.on("open", () => {
  console.log("Connected to KanbanGPT");

  ws.send(JSON.stringify({
    type: "userMessage",
    text: "create a project called AI Startup"
  }));
});

ws.on("message", (data) => {
  const lines = data.toString().split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line || !line.startsWith("data:")) continue;

    const payload = line.replace(/^data:\s*/, '');
    if (payload === "[DONE]") {
      console.log("\n=== FINAL OUTPUT ===\n");
      console.log(fullMessage);
      console.log("\n====================\n");
      return;
    }

    try {
      const obj = JSON.parse(payload);
      const content = obj.choices?.[0]?.delta?.content;
      if (content) {
        fullMessage += content;
      }
    } catch (err) {
      // ignore non-JSON lines
    }
  }
});

ws.on("close", () => {
  console.log("Disconnected");
});