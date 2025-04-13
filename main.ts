// @deno-types="npm:@types/express@4.17.15"
import express from "npm:express";
import { WebSocketServer } from "npm:ws";
const app = express();
const rumor = express();
import api from "./api.ts";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import https from "node:https";

const combcert = fs.readFileSync(path.resolve(os.homedir(), "Desktop", "=key", "certcf.pem"));
const robots = path.resolve(os.homedir(), "Desktop", "=key", "robots.txt");

const webserver = https.createServer({
  cert: combcert,
  key: combcert,
}, app)

let d = "n"
const server = https.createServer({
  cert: combcert,
  key: combcert,
}, rumor)
server.listen(7443, () => console.log('SECServer running on port 7443'));

const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log("cc");
  ws.on('error', console.error);
  ws.on('message', function message(data) {
    console.log('received: %s', data);
    d = data.toString();

    console.log("conn: ", wss.clients.size);
    // Broadcast to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        if (client != ws) {
        try {
          console.log(d);
          client.send(d);
        } catch (error) {
          console.error("error.packet: ", error);
        }
        }
    }
    });
  });

  ws.send('{"version": "3"}');
});

rumor.get("/robots.txt", (_req, res) => {
   try {
   res.sendFile(robots);
   } catch {
    // nothing
   }
});

app.use("/api", api);
app.get("/", (_req, res) => {
  res.send("not set up");
  // res.sendFile(`../pages/landing.html`);
});
//let oldwsglobal = "none"

webserver.listen(6443); // web
console.log("RUMOR online and ready!");
