import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";

const host = "127.0.0.1";
const port = 27017;
const dbPath = ".mongo-data";

if (await portIsOpen(host, port)) {
  console.log(`MongoDB already running on ${host}:${port}`);
  setInterval(() => {}, 60_000);
} else {
  fs.mkdirSync(dbPath, { recursive: true });

  const child = spawn(
    "mongod",
    ["--dbpath", dbPath, "--bind_ip", host, "--port", String(port), "--nounixsocket"],
    { stdio: "inherit" },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}

function portIsOpen(hostname, targetPort) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostname, port: targetPort });
    socket.setTimeout(650);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}
