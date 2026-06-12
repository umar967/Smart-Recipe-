import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes when GEMINI_API_KEY is not defined yet
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to deconstruct recipes with AI.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint to deconstruct recipes using Gemini AI
app.post("/api/deconstruct", async (req, res) => {
  try {
    const { recipeText } = req.body;
    if (!recipeText || typeof recipeText !== "string" || recipeText.trim().length === 0) {
      return res.status(400).json({ error: "Recipe content cannot be empty." });
    }

    const ai = getAiClient();
    const prompt = `
      You are a sophisticated chef sous-chef AI. Your mission is to take the following messy, unstructured recipe text and deconstruct it into clean recipe metrics and structured data.
      
      Here is the unstructured recipe:
      """
      ${recipeText}
      """

      Rules:
      1. Correct names: Extract a clean, appealing name for the recipe (e.g. "Artisanal Sourdough").
      2. Yield: Extract the serving/yield (e.g. "1x Batch", "4 Servings", "12 Cookies").
      3. Ingredients: Parse and split ingredients. For each ingredient:
         - Provide its clean common retail name (e.g., "Strong Bread Flour").
         - Extract the physical unit string (e.g. "g", "tbsp", "cups", "ml", "eggs", "cloves") and the exact numeric value (e.g. 500, 2, 1.5).
         - Categorize the ingredient strictly into one of: "Produce", "Pantry", "Dairy", "Meat", "Bakery", "Other".
      4. Cooking Steps: Filter and simplify instructions into sequential steps:
         - Assign sequential natural numbers starting at 1.
         - Formulate a clear, short title for the step (e.g. "Autolyse").
         - Write a detailed description of what to do.
         - Detect if there are timing instructions in that step (e.g., "Let it rest for 30 minutes", "Mix for 5 minutes"). Extract the maximum timer duration in seconds. If no timer or waiting period is required, set it to 0 or null.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
              description: "The title of the culinary recipe",
            },
            yieldText: {
              type: Type.STRING,
              description: "Standard yield of this recipe, e.g. '1x Batch' or '4 servings'",
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amountText: { type: Type.STRING, description: "Formatted readable text, e.g. '500g' or '3 large cloves'" },
                  numericValue: { type: Type.NUMBER, description: "Extract only the numeric value of the amount, e.g. 500 or 3. If fractional, write as float, e.g. 1.5. If not measurable, write null." },
                  unit: { type: Type.STRING, description: "Extracted singular unit of measurement, e.g. 'g', 'ml', 'clove', 'large', 'cup', or empty string" },
                  category: { type: Type.STRING, description: "Strictly either: 'Produce', 'Pantry', 'Dairy', 'Meat', 'Bakery', or 'Other'" },
                },
                required: ["name", "amountText", "category"],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: "Short action-oriented step title, e.g. 'Mix ingredients' or 'Autolyse'" },
                  description: { type: Type.STRING, description: "Full descriptive text of instructions for this cook step" },
                  timerDuration: { type: Type.INTEGER, description: "Duration in total seconds if a timer is appropriate. Otherwise 0 or null." },
                },
                required: ["stepNumber", "title", "description"],
              },
            },
          },
          required: ["recipeName", "yieldText", "ingredients", "steps"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Failed to parse recipe:", err);
    return res.status(500).json({ error: err.message || "Failed to process recipe deconstruction." });
  }
});

// Configure Vite or Serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for rendering react on the same dev port
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing at http://localhost:${PORT}`);
  });
}

startServer();
