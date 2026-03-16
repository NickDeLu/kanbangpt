import { WebSocketServer, WebSocket } from "ws";
import { VeniceService } from "../services/VeniceService";
import { StreamProcessor } from "../streaming/StreamProcessor";

export function initChatGateway(wss: WebSocketServer) {

  wss.on("connection", (socket: WebSocket) => {

    console.log("Client connected");

    socket.on("message", async (data) => {

      try {

        const payload = JSON.parse(data.toString());

        if (payload.type !== "userMessage") return;

        const text = payload.text;

        const messages = [
          {
            role: "system",
 content: `
You are KanbanGPT, an AI assistant that interacts with a project management backend.

All commands the user wants executed must be returned in a strict JSON object with this structure:

{
  "tools": [
    {
      "tool": "<tool_name>",
      "args": { "<arg_name>": "<arg_value>" }
    }
  ],
  "text": "<human-readable summary or success message>"
}

Rules:
1. Only respond with a valid JSON object that matches the schema above.
2. "tools" contains the actions to perform. Each tool must have a "tool" name and an "args" object.
3. "text" is optional but recommended: it summarizes the result in human-readable form.
4. Never include code, tags, or extra text outside the JSON object.
5. Only include tools that should be executed. If no tools are needed, return "tools": [] and an explanatory "text".
6. Always validate JSON structure before sending. Do not split JSON or insert partial fields.

Available tools:

1. create_project
   - args: { title: string }
2. create_task
   - args: { project_title: string, status_title: string, description: string }
3. move_task
   - args: { task_id: string, project_title: string, new_status: string }
4. delete_project
   - args: { project_title: string }

Example:

User: create a project called AI Startup
Assistant:
{
  "tools": [
    {
      "tool": "create_project",
      "args": { "title": "AI Startup" }
    }
  ],
  "text": "Project 'AI Startup' created successfully."
}
`
          },
          {
            role: "user",
            content: text
          }
        ];

        const stream = await VeniceService.chat(messages);

        StreamProcessor.process(stream, socket);

      } catch (err) {
        console.error(err);
      }

    });

  });

}