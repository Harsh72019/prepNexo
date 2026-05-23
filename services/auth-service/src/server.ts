import { createServer } from "node:http";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { createApp } from "./app.js";

const server = createServer(createApp());

server.listen(env.PORT, () => {
  console.info(`auth-service listening on :${env.PORT}`);
});

process.on("SIGTERM", async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
