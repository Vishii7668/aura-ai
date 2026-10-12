// AI MindSET – tiny local web server (no extra packages needed)
// Run:  npm start   (or)   node server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const START_PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
};

function handler(req, res) {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(ROOT, urlPath));

  // block access outside the project folder
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Page not found");
    }
    const type = TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  });
}

function start(port) {
  const server = http.createServer(handler);
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      start(port + 1);
    } else {
      console.error(e);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    console.log("");
    console.log("  AI MindSET website is running");
    console.log(`  Open:  http://localhost:${port}`);
    console.log("  Stop:  press Ctrl + C");
    console.log("");
  });
}

start(START_PORT);
