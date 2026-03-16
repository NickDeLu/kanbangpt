import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import { pool } from "./database";
import projectRoutes from "./routes/project.routes";
import { initChatGateway } from "./websocket/ChatGateway";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/projects", projectRoutes);

const httpServer = createServer(app);

/*
WebSocket server
*/
const wss = new WebSocketServer({
  server: httpServer
});

initChatGateway(wss);

httpServer.listen(PORT, async () => {

  try {

    // const result = await pool.query("SELECT * FROM testtable");

    // console.log("Database Connection Test:", result.rows[0].field2);

    console.log(`HTTP API running at http://localhost:${PORT}`);

    console.log("WebSocket server ready");

  } catch (err) {
    console.error(err);
  }

});