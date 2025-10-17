import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 3001,
});

function broadcast(data: any) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on("connection", (ws, req) => {
  console.log(`Connection made from ${req.socket.remoteAddress}`);

  ws.on("message", (raw: string) => {
    const msg = JSON.parse(raw);
    console.log(`Message: ${raw}: ${msg}`);
    broadcast(msg);
  });

  ws.on("close", () => console.log("Client disconnected"));
});
