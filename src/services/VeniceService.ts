import axios from "axios";

export class VeniceService {

  static async chat(messages: any[]) {

    const response = await axios.post(
      "https://api.venice.ai/api/v1/chat/completions",
      {
        model: process.env.VENICE_MODEL,
        messages,
        stream: true,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "tool_call_response",
                strict: true,
                schema: {
                type: "object",
                properties: {
                    tools: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                tool: { type: "string" },
                                args: { type: "object" }
                            },
                            required: ["tool", "args"],
                            additionalProperties: false
                        }
                    },
                    text: { type: "string" }  // optional free text
                },
                required: ["tools", "text"],
                additionalProperties: false
                }
            }
            }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VENICE_AUTH_KEY}`,
          "Content-Type": "application/json"
        },
        responseType: "stream",
        timeout: 0
      }
    );

    return response.data;

  }

}