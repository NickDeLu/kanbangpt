import { ToolCallParser } from "../ai/ToolCallParser";
import { CommandFactory } from "../commands/CommandFactory";

export class StreamProcessor {

  static async process(stream: any, socket: any) {

    let buffer = "";
    let paused = false;

    stream.on("data", async (chunk: any) => {

      const text = chunk.toString();

      buffer += text;

      const result = ToolCallParser.extractToolCall(buffer);

      if (result && !paused) {

        paused = true;

        const { toolCall, remainingBuffer } = result;

        buffer = remainingBuffer;

        socket.send(JSON.stringify({
          type: "toolDetected",
          data: toolCall
        }));

        try {

          for (const tool of toolCall.tools) {

            console.log("Executing tool:", tool.tool);

            const command = CommandFactory.create(tool);

            await command.execute();

          }

          socket.send(JSON.stringify({
            type: "commandSuccess"
          }));

          paused = false;

        } catch (err) {

          console.error(err);

          socket.send(JSON.stringify({
            type: "commandError"
          }));

        }

      } else {

        if (!paused) {

          socket.send(JSON.stringify({
            type: "textChunk",
            data: text
          }));

        }

      }

    });

  }

}