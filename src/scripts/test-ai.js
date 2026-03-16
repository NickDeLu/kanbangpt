const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

// We'll collect the full response here
let fullMessage = "";

ws.on("open", () => {
  console.log("Connected to KanbanGPT");

  ws.send(
    JSON.stringify({
      type: "userMessage",
      text: "create a project called AI Startup and a task called Build MVP in the AI Startup project and move the status from To Do, to In Progress",
    })
  );
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());

  // Log each chunk if you want to debug
  console.log("SERVER:", msg);

  // Only accumulate the 'content' from text chunks
  if (msg.type === "textChunk") {
    const chunk = msg.data;

    // The 'data:' lines are actually part of the Server-Sent Events format
    // We'll try to parse each one
    chunk.split("\n\n").forEach((line) => {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6); // remove 'data: '
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.content) {
            fullMessage += delta.content;
          }
        } catch (err) {
          // ignore parse errors (like [DONE])
        }
      }
    });
  }
});

ws.on("close", () => {
  console.log("Disconnected");
  console.log("\n=== FULL MESSAGE ===\n");
  console.log(fullMessage);
});