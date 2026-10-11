
import http from "node:http";

const PORT = 5501;
const API = "http://127.0.0.1:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://127.0.0.1:5500",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);

    const body = Buffer.concat(chunks);

    const upstream = await fetch(`${API}${req.url}`, {
      method: req.method,
      headers: {
        "Content-Type":
          req.headers["content-type"] || "application/json",
      },
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : body,
    });

    res.writeHead(upstream.status, {
      ...corsHeaders,
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
    });

    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.writeHead(502, {
      ...corsHeaders,
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify({
      error: "API unavailable",
      detail: err.message,
    }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Encore proxy running at http://127.0.0.1:${PORT}`);
});