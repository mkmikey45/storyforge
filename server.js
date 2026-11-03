import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 8787;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "20kb" }));

const lengths = {
  short: "Write 150 to 250 words.",
  medium: "Write 400 to 650 words.",
  long: "Write 900 to 1300 words."
};

app.post("/api/story", async (req, res) => {
  try {
    const { idea, length = "medium", genre = "Mystery", style = "Cinematic" } = req.body || {};

    if (typeof idea !== "string" || idea.trim().length < 3) {
      return res.status(400).json({ error: "Please enter a story idea with at least 3 characters." });
    }
    if (idea.length > 1200) {
      return res.status(400).json({ error: "Your idea is too long. Keep it under 1,200 characters." });
    }
    if (!lengths[length]) {
      return res.status(400).json({ error: "Choose a valid story length." });
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "AI is not connected yet. Add your provider key to the .env file, then restart the server."
      });
    }

    const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        max_tokens: length === "long" ? 1800 : length === "medium" ? 950 : 450,
        messages: [
          {
            role: "system",
            content: "You are StoryForge, a creative fiction writer. Write original, engaging stories based on the user's idea. Give the story a compelling title. Use clear paragraphs and a satisfying ending. Keep content suitable for a general teen audience: no graphic violence, explicit sexual content, or instructions for wrongdoing. Do not claim the story is true."
          },
          {
            role: "user",
            content: `Story idea: ${idea.trim()}\nGenre: ${genre}\nWriting style: ${style}\nLength: ${lengths[length]}`
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `AI provider returned status ${response.status}.`;
      return res.status(502).json({ error: message });
    }

    const story = data?.choices?.[0]?.message?.content?.trim();
    if (!story) return res.status(502).json({ error: "The AI returned an empty story. Please try again." });

    res.json({ story });
  } catch (error) {
    console.error("Story generation failed:", error);
    res.status(500).json({ error: "Something went wrong while generating the story." });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
}

app.listen(PORT, () => console.log(`StoryForge server running on http://localhost:${PORT}`));
