import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4004);

app.get("/health", (_req, res) => res.json({ ok: true, service: "analytics-service" }));

app.listen(port, () => console.info(`analytics-service listening on :${port}`));
