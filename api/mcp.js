import fetch from "node-fetch";

const TARGET_MCP = "https://mcp-dev.bitrix24.tech/mcp";

export default async function handler(req, res) {
  try {
    const response = await fetch(TARGET_MCP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
