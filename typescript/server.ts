import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const projectRoot = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.join(projectRoot, "config", "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(projectRoot, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Recipe (offline) running at http://localhost:${PORT}`);
  });
}

startServer();
