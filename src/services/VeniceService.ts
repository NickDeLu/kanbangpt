import axios from "axios";

export class VeniceService {

  static async chat(messages: any[]) {

    const response = await axios.post(
      "https://api.venice.ai/api/v1/chat/completions",
      {
        model: process.env.VENICE_MODEL,
        messages,
        stream: true
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