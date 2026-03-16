// export class ToolCallParser {

//   static extractToolCall(buffer: string) {

//     const start = buffer.indexOf("<toolcall-json>");
//     const end = buffer.indexOf("</toolcall-json>");

//     if (start === -1 || end === -1) return null;

//     const json = buffer.substring(
//       start + "<toolcall-json>".length,
//       end
//     );

//     return JSON.parse(json);
//   }

// }

export class ToolCallParser {

  static extractToolCall(buffer: string) {

    const startTag = "<toolcall-json>";
    const endTag = "</toolcall-json>";

    const start = buffer.indexOf(startTag);
    const end = buffer.indexOf(endTag);

    if (start === -1 || end === -1) {
      return null;
    }

    const jsonStart = start + startTag.length;
    const json = buffer.substring(jsonStart, end);

    try {

      const parsed = JSON.parse(json);

      const remainingBuffer = buffer.slice(end + endTag.length);

      return {
        toolCall: parsed,
        remainingBuffer
      };

    } catch (err) {

      console.error("Invalid tool JSON:", err);

      return null;

    }

  }

}