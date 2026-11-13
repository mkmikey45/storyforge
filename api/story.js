export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  try {
    const {
      idea,
      length = "medium",
      genre = "Mystery",
      style = "Cinematic"
    } = req.body || {};

    const lengths = {
      short: "Write 150 to 250 words.",
      medium: "Write 400 to 650 words.",
      long: "Write 900 to 1300 words."
    };

    if (typeof idea !== "string" || idea.trim().length < 3) {
      return res.status(400).json({
        error: "Please enter a story idea with at least 3 characters."
      });
    }

    if (idea.length > 1200) {
      return res.status(400).json({
        error: "Your idea is too long."
      });
    }

    if (!lengths[length]) {
      return res.status(400).json({
        error: "Choose a valid story length."
      });
    }

    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "AI is not connected yet. Check your Vercel environment variables."
      });
    }

    const baseUrl = (
      process.env.AI_BASE_URL || "https://api.openai.com/v1"
    ).replace(/\/+$/, "");

    const model = process.env.AI_MODEL || "gpt-4o-mini";

    const response = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.9,
          max_tokens:
            length === "long" ? 1800 :
            length === "medium" ? 950 : 450,
          messages: [
            {
              role: "system",
              content:
                "You are StoryForge, a creative fiction writer. Write original, engaging stories with a compelling title, clear paragraphs and a satisfying ending. Keep content suitable for a general teen audience."
            },
            {
              role: "user",
              content:
                `Story idea: ${idea.trim()}\nGenre: ${genre}\nWriting style: ${style}\nLength: ${lengths[length]}`
            }
          ]
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(502).json({
        error: data?.error?.message ||
          `AI provider returned status ${response.status}.`
      });
    }

    const story = data?.choices?.[0]?.message?.content?.trim();

    if (!story) {
      return res.status(502).json({
        error: "The AI returned an empty story. Please try again."
      });
    }

    return res.status(200).json({ story });

  } catch (error) {
    console.error("Story generation failed:", error);

    return res.status(500).json({
      error: "Something went wrong while generating your story."
    });
  }
}