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
import { ToolChainExecutor } from "../ai/ToolChainExecutor";

export class StreamProcessor {

  private static extractTextFromJsonBuffer(jsonBuffer: string): string | null {
    const keyIndex = jsonBuffer.indexOf('"text"');
    if (keyIndex === -1) return null;

    const colonIndex = jsonBuffer.indexOf(":", keyIndex);
    if (colonIndex === -1) return null;

    const quoteStart = jsonBuffer.indexOf('"', colonIndex + 1);
    if (quoteStart === -1) return null;

    let i = quoteStart + 1;
    let escaped = false;
    let out = "";

    while (i < jsonBuffer.length) {
      const ch = jsonBuffer[i];

      if (escaped) {
        if (ch === "n") out += "\n";
        else if (ch === "t") out += "\t";
        else if (ch === "r") out += "\r";
        else if (ch === '"') out += '"';
        else if (ch === "\\") out += "\\";
        else out += ch;
        escaped = false;
        i++;
        continue;
      }

      if (ch === "\\") {
        escaped = true;
        i++;
        continue;
      }

      if (ch === '"') {
        return out;
      }

      out += ch;
      i++;
    }

    // Text string is still in progress (no closing quote yet).
    // Return what we have so far to enable true incremental streaming.
    return out;
  }

  static async process(stream: any, socket: any, onResponseComplete?: (assistantText: string) => void, onToolResult?: (toolName: string, result: any) => void) {

    let sseBuffer = "";
    let fullAssistantResponse: any = null;
    let rawJsonBuffer = "";
    let emittedTextLength = 0;

    ToolCallParser.reset();

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
          // Call the completion callback with the full response
          if (fullAssistantResponse && onResponseComplete) {
            const responseStr = JSON.stringify(fullAssistantResponse);
            onResponseComplete(responseStr);
          }
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

          // Stream visible text progressively while JSON is still incomplete.
          rawJsonBuffer += content;
          const partialText = StreamProcessor.extractTextFromJsonBuffer(rawJsonBuffer);
          if (partialText !== null && partialText.length > emittedTextLength) {
            const deltaText = partialText.slice(emittedTextLength);
            emittedTextLength = partialText.length;
            socket.send(JSON.stringify({
              type: "textChunk",
              data: deltaText
            }));
          }

          // Feed parser
          const result = ToolCallParser.extract(content);

          if (result) {

            fullAssistantResponse = result;
            const { tools, text } = result;

            // Flush any remaining text not already streamed.
            if (text && text.length > emittedTextLength) {
              const remainingText = text.slice(emittedTextLength);
              emittedTextLength = text.length;
              socket.send(JSON.stringify({
                type: "textChunk",
                data: remainingText
              }));
            }

            // Only execute tools if tools array is not empty
            if (tools && tools.length > 0) {
              const executor = new ToolChainExecutor(socket, onToolResult);
              await executor.executeTools(tools);
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