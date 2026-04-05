const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

// We'll collect the full response here
let fullMessage = "";

let messagesSent = 0;

ws.on("open", () => {
  console.log("Connected to KanbanGPT");

  // Send first message
  ws.send(
    JSON.stringify({
      type: "userMessage",
      text: "Create a task called 'Design API2' in TestProject, then move it to Done",
    })
  );
  messagesSent++;
});

ws.on("error", (err) => {
  console.error("❌ WebSocket Error:", err.message);
});

// After first response completes, send second message
let responseCount = 0;

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());

  // Log each chunk if you want to debug
  console.log("SERVER:", msg);

  // Check for confirmation requests in text chunks
  if (msg.type === "textChunk" && (msg.data.includes("confirm") || msg.data.includes("proceed"))) {
    console.log("\n🤖 AI asked for confirmation, sending 'yes'...\n");
    ws.send(
      JSON.stringify({
        type: "userMessage",
        text: "yes",
      })
    );
    messagesSent++;
    return; // Don't process further for this message
  }

  // Count tool execution completions to know when a response is done
  if (msg.type === "commandSuccess") {
    console.log(`✅ Command executed: ${msg.data}`);
    // After first response completes, send second message
    if (messagesSent === 1) {
      console.log("\n--- Sending 2nd message in same connection ---\n");
      ws.send(
        JSON.stringify({
          type: "userMessage",
          text: "Yes proceed",
        })
      );
      messagesSent++;
    }
  }

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
  console.log(fullMessage || "(no response received)");
});

// // Auto-close after 15 seconds to give Venice API time to respond and handle confirmation
// setTimeout(() => {
//   console.log("\n⏱️  Timeout reached, closing connection...");
//   ws.close();
// }, 15000);