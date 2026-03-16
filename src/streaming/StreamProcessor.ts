// import { ToolCallParser } from "../ai/ToolCallParser";
// import { CommandFactory } from "../commands/CommandFactory";

// export class StreamProcessor {
//   static async process(stream: any, socket: any) {
//     let buffer = "";
//     let paused = false;

//     // Handle a single assistant delta
//     const handleDelta = async (delta: any) => {
//       if (!delta || !delta.content) return;

//       buffer += delta.content; // only append the content

//       // Attempt to extract a tool call
//       const result = ToolCallParser.extractToolCall(buffer);
//       console.log("extractToolCall result:", result);

//       if (result && !paused) {
//         paused = true;

//         const { toolCall, remainingBuffer } = result;
//         buffer = remainingBuffer;

//         socket.send(JSON.stringify({ type: "toolDetected", data: toolCall }));

//         try {
//           for (const tool of toolCall.tools) {
//             console.log("Executing tool:", tool.tool);
//             const command = CommandFactory.create(tool);
//             await command.execute();
//           }
//           socket.send(JSON.stringify({ type: "commandSuccess" }));
//         } catch (err) {
//           console.error("Tool execution error:", err);
//           socket.send(JSON.stringify({ type: "commandError" }));
//         } finally {
//           paused = false;
//         }
//       } else if (!paused) {
//         socket.send(JSON.stringify({ type: "textChunk", data: delta.content }));
//       }
//     };

//     stream.on("data", async (chunk: any) => {
//       const text = chunk.toString();
//       console.log("Received chunk:", text);

//       // Split multiple SSE messages in one chunk
//       const lines = text.split("\n\n").filter(Boolean);

//       for (const line of lines) {
//         if (line === "data: [DONE]") {
//           console.log("Stream finished.");
//           return;
//         }

//         if (!line.startsWith("data: ")) continue;

//         try {
//           const parsed = JSON.parse(line.replace(/^data: /, ""));
//           const delta = parsed.choices?.[0]?.delta;
//           await handleDelta(delta);
//         } catch (err) {
//           console.error("Failed to parse chunk:", err);
//         }
//       }
//     });

//     stream.on("end", () => console.log("Stream ended."));
//     stream.on("error", (err: any) => {
//       console.error("Stream error:", err);
//       socket.send(JSON.stringify({ type: "streamError", data: err.message }));
//     });
//   }
// }



import { ToolCallParser } from "../ai/ToolCallParser";
import { CommandFactory } from "../commands/CommandFactory";

export class StreamProcessor {

  static async process(stream: any, socket: any) {

    let sseBuffer = "";

    stream.on("data", async (chunk: any) => {

      const text = chunk.toString();
      sseBuffer += text;

      let boundary = sseBuffer.indexOf("\n\n");

      while (boundary !== -1) {

        const line = sseBuffer.slice(0, boundary).trim();
        sseBuffer = sseBuffer.slice(boundary + 2);

        if (!line.startsWith("data: ")) {
          boundary = sseBuffer.indexOf("\n\n");
          continue;
        }

        const jsonStr = line.replace(/^data: /, "");

        if (jsonStr === "[DONE]") {
          console.log("Stream finished.");
          return;
        }

        try {

          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta;

          if (!delta) {
            boundary = sseBuffer.indexOf("\n\n");
            continue;
          }

          const content = delta.content || delta.text;
          if (!content) {
            boundary = sseBuffer.indexOf("\n\n");
            continue;
          }

          // Feed parser
          const result = ToolCallParser.extract(content);

          if (result) {

            const { tools, text } = result;

            // Execute tools sequentially
            for (const tool of tools) {

              socket.send(JSON.stringify({
                type: "toolDetected",
                data: tool
              }));

              try {

                const command = CommandFactory.create(tool);
                await command.execute();

                socket.send(JSON.stringify({
                  type: "commandSuccess",
                  data: tool.tool
                }));

              } catch (err: any) {

                console.error("Tool execution error:", err);

                socket.send(JSON.stringify({
                  type: "commandError",
                  data: err.message
                }));
              }
            }

            // Stream final AI text
            if (text) {

              socket.send(JSON.stringify({
                type: "textChunk",
                data: text
              }));

            }

          }

        } catch {
          console.warn("Partial SSE JSON, waiting...");
        }

        boundary = sseBuffer.indexOf("\n\n");
      }

    });

    stream.on("end", () => {
      console.log("Stream ended.");
    });

    stream.on("error", (err: any) => {

      console.error("Stream error:", err);

      socket.send(JSON.stringify({
        type: "streamError",
        data: err.message
      }));

    });

  }

}