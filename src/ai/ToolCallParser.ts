// // export class ToolCallParser {

// //   static extractToolCall(buffer: string) {

// //     const start = buffer.indexOf("<toolcall-json>");
// //     const end = buffer.indexOf("</toolcall-json>");

// //     if (start === -1 || end === -1) return null;

// //     const json = buffer.substring(
// //       start + "<toolcall-json>".length,
// //       end
// //     );

// //     return JSON.parse(json);
// //   }

// // }


// export class ToolCallParser {

//   static extractToolCall(buffer: string) {

//     const startTag = "<toolcall-json>";
//     const endTag = "</toolcall-json>";

//     const start = buffer.indexOf(startTag);
//     const end = buffer.indexOf(endTag);

//     if (start === -1 || end === -1) {
//       return null;
//     }

//     const jsonStart = start + startTag.length;
//     const json = buffer.substring(jsonStart, end);

//     try {
//         console.log("parsing JSON:", json);
//       const parsed = JSON.parse(json);
    
//       const remainingBuffer = buffer.slice(end + endTag.length);
//         console.log("Extracted tool call:", parsed);
//       return {
//         toolCall: parsed,
//         remainingBuffer
//       };

//     } catch (err) {

//       console.error("Invalid tool JSON:", err);
//         console.error("Offending JSON:", json);
//       return null;

//     }

//   }

// }


export class ToolCallParser {

  private static buffer = "";
  private static depth = 0;
  private static started = false;

  static extract(chunk: string): { tools: any[], text: string } | null {

    this.buffer += chunk;

    for (const char of chunk) {

      if (char === "{") {
        this.depth++;
        this.started = true;
      }

      if (char === "}") {
        this.depth--;
      }

    }

    // JSON object completed
    if (this.started && this.depth === 0) {

      try {

        const parsed = JSON.parse(this.buffer);

        this.reset();

        return {
          tools: parsed.tools || [],
          text: parsed.text || ""
        };

      } catch (err) {

        console.error("Failed parsing AI JSON:", err);
        console.error("Buffer was:", this.buffer);
        this.reset();
      }
    }

    return null;
  }

  static reset() {
    this.buffer = "";
    this.depth = 0;
    this.started = false;
  }

}