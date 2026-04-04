import { CommandFactory } from "../commands/CommandFactory";

export class ToolChainExecutor {

  constructor(private socket: any) {}

  async executeTools(tools: any[]): Promise<void> {
    const results: { [key: string]: any } = {};

    for (const tool of tools) {
      // Substitute args
      const substitutedArgs = this.substituteArgs(tool.args, results);

      // Create command with substituted args
      const command = CommandFactory.create({
        tool: tool.tool,
        args: substitutedArgs
      });

      // Send tool detected
      this.socket.send(JSON.stringify({
        type: "toolDetected",
        data: tool
      }));

      try {
        // Execute and store result
        const result = await command.execute();
        results[tool.tool] = result;

        // Send success
        this.socket.send(JSON.stringify({
          type: "commandSuccess",
          data: tool.tool
        }));
      } catch (err: any) {
        console.error("Tool execution error:", err);
        this.socket.send(JSON.stringify({
          type: "commandError",
          data: err.message
        }));
        throw err; // Re-throw to stop chain?
      }
    }
  }

  private substituteArgs(args: any, results: { [key: string]: any }): any {
    const substituted = { ...args };

    for (const key in substituted) {
      if (typeof substituted[key] === 'string') {
        substituted[key] = this.substituteString(substituted[key], results);
      } else if (typeof substituted[key] === 'object' && substituted[key] !== null) {
        substituted[key] = this.substituteArgs(substituted[key], results);
      }
    }

    return substituted;
  }

  private substituteString(str: string, results: { [key: string]: any }): any {
    const regex = /\$(\w+)\.result(?:\.(\w+)|\[(\d+)\])/g;
    let match;
    let result = str;

    while ((match = regex.exec(str)) !== null) {
      const toolName = match[1];
      const field = match[2];
      const index = match[3];

      if (results[toolName]) {
        let value;
        if (index !== undefined) {
          // Array access
          const arr = results[toolName];
          if (Array.isArray(arr)) {
            value = arr[parseInt(index)];
          }
        } else if (field) {
          // Object field
          value = results[toolName][field];
        } else {
          // Whole result
          value = results[toolName];
        }

        result = result.replace(match[0], value);
      }
    }

    return result;
  }

}